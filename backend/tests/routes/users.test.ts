import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { swaggerConfig, swaggerUiConfig } from '../../src/config/swagger.config';
import usersRoutes from '../../src/routes/users';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';

describe('Users API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Create test Fastify instance
    app = Fastify({
      logger: false,
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(cors, {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    });

    await app.register(swagger, {
      ...swaggerConfig,
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, swaggerUiConfig);

    await app.register(usersRoutes, { prefix: '/api/users' });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(users);
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'John',
        surname: 'Doe',
        gender: 'male' as const,
        isTrusted: false,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: newUser,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: expect.any(Number),
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should create a user with default isTrusted value', async () => {
      const newUser = {
        name: 'Jane',
        surname: 'Smith',
        gender: 'female' as const,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: newUser,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.isTrusted).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidUser = {
        name: 'John',
        // missing surname and gender
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: invalidUser,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid gender', async () => {
      const invalidUser = {
        name: 'John',
        surname: 'Doe',
        gender: 'invalid',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: invalidUser,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for name too long', async () => {
      const invalidUser = {
        name: 'a'.repeat(256),
        surname: 'Doe',
        gender: 'male' as const,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: invalidUser,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users', () => {
    it('should return an empty array when no users exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });

    it('should return all users', async () => {
      // Create test users
      await db.insert(users).values([
        { name: 'John', surname: 'Doe', gender: 'male', isTrusted: false },
        { name: 'Jane', surname: 'Smith', gender: 'female', isTrusted: true },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
      });
      expect(body[1]).toMatchObject({
        name: 'Jane',
        surname: 'Smith',
        gender: 'female',
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const [createdUser] = await db.insert(users).values({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      }).returning();

      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${createdUser.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: createdUser.id,
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/99999',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/invalid',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const [createdUser] = await db.insert(users).values({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      }).returning();

      const updateData = {
        name: 'Johnny',
        isTrusted: true,
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${createdUser.id}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: createdUser.id,
        name: 'Johnny',
        surname: 'Doe',
        gender: 'male',
        isTrusted: true,
      });
    });

    it('should update only provided fields', async () => {
      const [createdUser] = await db.insert(users).values({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      }).returning();

      const updateData = {
        surname: 'Smith',
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${createdUser.id}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: createdUser.id,
        name: 'John',
        surname: 'Smith',
        gender: 'male',
        isTrusted: false,
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/99999',
        payload: { name: 'Test' },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid update data', async () => {
      const [createdUser] = await db.insert(users).values({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      }).returning();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${createdUser.id}`,
        payload: { gender: 'invalid' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const [createdUser] = await db.insert(users).values({
        name: 'John',
        surname: 'Doe',
        gender: 'male',
        isTrusted: false,
      }).returning();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${createdUser.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        message: 'User deleted successfully',
      });

      // Verify user is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/users/${createdUser.id}`,
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/99999',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/invalid',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});