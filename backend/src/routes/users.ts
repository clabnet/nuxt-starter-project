import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { db } from '../db';
import { users, usersSqlite } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

import {
  createUserBodySchema,
  getUserParamSchema,
  updateUserBodySchema,
  deleteUserParamSchema,
  userResponseSchema,
  usersListResponseSchema,
  errorResponseSchema,
  deleteSuccessResponseSchema,
} from '../schemas/users.schema';

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
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/users
  server.get('/', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: usersListResponseSchema,
        500: errorResponseSchema,
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
  server.get('/:id', {
    schema: {
      description: 'Get a user by ID',
      tags: ['users'],
      params: getUserParamSchema,
      response: {
        200: userResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
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
  server.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: createUserBodySchema,
      response: {
        201: userResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const newUser = await db.insert(users).values(request.body).returning();
      const serialized = serializeUser(newUser[0]);
      return reply.status(201).type('application/json').send(JSON.stringify(serialized));
    } catch (error: any) {
      console.error('Error creating user:', error);
      return reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // PUT /api/users/:id
  server.put('/:id', {
    schema: {
      description: 'Update a user',
      tags: ['users'],
      params: getUserParamSchema,
      body: updateUserBodySchema,
      response: {
        200: userResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updatedUser = await db
        .update(users)
        .set({ ...request.body, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning();

      if (updatedUser.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const serialized = serializeUser(updatedUser[0]);
      return reply.type('application/json').send(JSON.stringify(serialized));
    } catch (error: any) {
      console.error('Error updating user:', error);
      return reply.status(500).send({ error: 'Failed to update user' });
    }
  });

  // DELETE /api/users/:id
  server.delete('/:id', {
    schema: {
      description: 'Delete a user',
      tags: ['users'],
      params: getUserParamSchema,
      response: {
        200: deleteSuccessResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
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