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

type User = InferSelectModel<typeof usersSqlite>;

// Helper function to serialize user data
const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  surname: user.surname,
  gender: user.gender,
  isTrusted: user.isTrusted,
  createdAt: user.createdAt, // TypeScript knows this is a string
  updatedAt: user.updatedAt,
});


const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/users - Get all users
  fastify.get('/', async (request, reply) => {
    try {
      const allUsers = await db.select().from(users);
      const serializedUsers = allUsers.map(serializeUser);
      return reply.type('application/json').send(JSON.stringify(serializedUsers));
    } catch (error) {
      console.error('Error fetching users:', error);
      return reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  // GET /api/users/:id - Get user by ID
  fastify.get('/:id', async (request, reply) => {
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

  // POST /api/users - Create a new user
  fastify.post('/', async (request, reply) => {
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

  // PUT /api/users/:id - Update a user
  fastify.put('/:id', async (request, reply) => {
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

  // DELETE /api/users/:id - Delete a user
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = deleteUserParamSchema.parse(request.params);
      const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

      if (deletedUser.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Return 200 with success message instead of 204
      return reply.status(200).send({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return reply.status(500).send({ error: 'Failed to delete user' });
    }
  });
};

export default usersRoutes;
