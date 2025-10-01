import { FastifyPluginAsync } from 'fastify';
import { db } from '../db';
import { users, usersSqlite } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

import {
  createUserBodySchema,
  getUserParamSchema,
  updateUserBodySchema,
  deleteUserParamSchema,
} from '../schemas/users.schema';

import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  errorSchema,
  validationErrorSchema,
  deleteSuccessSchema,
} from '../schemas/swagger.schema';

type User = InferSelectModel<typeof usersSqlite>;

const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  surname: user.surname,
  gender: user.gender,
  isTrusted: user.isTrusted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/users
  fastify.get('/', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: { type: 'array', items: userSchema },
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const allUsers = await db.select().from(users);
      const serializedUsers = allUsers.map(serializeUser);
      return reply.type('application/json').send(JSON.stringify(serializedUsers));
    } catch (error) {
      console.error('Error fetching users:', error);
      return reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  // GET /api/users/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get a user by ID',
      tags: ['users'],
      params: userIdParamSchema,
      response: {
        200: userSchema,
        404: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = getUserParamSchema.parse(request.params);
      const user = await db.select().from(users).where(eq(users.id, id));

      if (user.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const serialized = serializeUser(user[0]);
      return reply.type('application/json').send(JSON.stringify(serialized));
    } catch (error) {
      console.error('Error fetching user:', error);
      return reply.status(500).send({ error: 'Failed to fetch user' });
    }
  });

  // POST /api/users
  fastify.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: createUserSchema,
      response: {
        201: userSchema,
        400: validationErrorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const validatedData = createUserBodySchema.parse(request.body);
      const newUser = await db.insert(users).values(validatedData).returning();
      const serialized = serializeUser(newUser[0]);
      return reply.status(201).type('application/json').send(JSON.stringify(serialized));
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // PUT /api/users/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update a user',
      tags: ['users'],
      params: userIdParamSchema,
      body: updateUserSchema,
      response: {
        200: userSchema,
        400: validationErrorSchema,
        404: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = getUserParamSchema.parse(request.params);
      const validatedData = updateUserBodySchema.parse(request.body);

      const updatedUser = await db
        .update(users)
        .set({ ...validatedData, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning();

      if (updatedUser.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const serialized = serializeUser(updatedUser[0]);
      return reply.type('application/json').send(JSON.stringify(serialized));
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: 'Failed to update user' });
    }
  });

  // DELETE /api/users/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a user',
      tags: ['users'],
      params: userIdParamSchema,
      response: {
        200: deleteSuccessSchema,
        404: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = deleteUserParamSchema.parse(request.params);
      const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

      if (deletedUser.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.status(200).send({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return reply.status(500).send({ error: 'Failed to delete user' });
    }
  });
};

export default usersRoutes;