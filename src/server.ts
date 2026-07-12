import { Server } from 'http';
import app from './app';
import { errorlogger, logger } from './app/utils/logger';
import { envVars } from './app/config/env';
import { seedSuperAdmin } from './app/utils/seed';
import { redisService } from './app/lib/redis';

let server: Server;

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down application...`);

  try {
    if (server) {
      await new Promise<void>(resolve => {
        server.close(() => {
          logger.info('HTTP server closed.');
          resolve();
        });
      });
    }

    // Disconnect Redis
    await redisService.disconnect().catch(err => {
      errorlogger.error('Redis disconnect failed:', err);
    });

    // Disconnect Prisma
    // await prisma.$disconnect();

    logger.info('Application shutdown completed.');
    process.exit(0);
  } catch (error) {
    errorlogger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Bootstrap application
const bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await redisService.connect();

    server = app.listen(envVars.PORT, () => {
      logger.info(`Server is running on port ${envVars.PORT}`);
    });

    // Graceful shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unexpected errors
    process.on('uncaughtException', async error => {
      errorlogger.error('Uncaught Exception:', error);
      await shutdown('uncaughtException');
    });

    process.on('unhandledRejection', async reason => {
      errorlogger.error('Unhandled Rejection:', reason);
      await shutdown('unhandledRejection');
    });
  } catch (error) {
    errorlogger.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
