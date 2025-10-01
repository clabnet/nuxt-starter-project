import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import * as dotenv from 'dotenv';
import { swaggerConfig, swaggerUiConfig } from './config/swagger.config';
import usersRoutes from './routes/users';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Start server
const start = async () => {
  try {
    // Register CORS - MUST be first
    // Since v11, default methods are only GET,HEAD,POST
    // We must explicitly include DELETE, PUT, PATCH
    await fastify.register(cors, {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    });

    // Register Swagger
    await fastify.register(swagger, swaggerConfig);
    await fastify.register(swaggerUi, swaggerUiConfig);

    // Health check route
    fastify.get('/health', async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    // Register routes
    await fastify.register(usersRoutes, { prefix: '/api/users' });

    // Start listening
    await fastify.listen({ port: PORT, host: HOST });

    console.log('');
    console.log('[SUCCESS] Server is running!');
    console.log('[INFO] Server address: http://localhost:' + PORT);
    console.log('[INFO] API Documentation: http://localhost:' + PORT + '/api-docs');
    console.log('[INFO] Health check: http://localhost:' + PORT + '/health');
    console.log('[INFO] CORS enabled for: http://localhost:3000');
    console.log('');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('');
  console.log('[INFO] Shutting down gracefully...');
  await fastify.close();
  console.log('[SUCCESS] Server closed');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

start();
