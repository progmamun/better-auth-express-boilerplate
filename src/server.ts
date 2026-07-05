import { Server } from 'http';
import app from './app';
import { errorlogger, logger } from './app/utils/logger';
import { envVars } from './app/config/env';
import { seedSuperAdmin } from './app/utils/seed';

let server: Server;

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down...`);

  try {
    if (server) {
      await new Promise<void>(resolve => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }

    // await prisma.$disconnect();
    // logger.info('Prisma disconnected');

    process.exit(0);
  } catch (error) {
    errorlogger.error('Shutdown error:', error);
    process.exit(1);
  }
};

// Bootstrap application
async function bootstrap() {
  try {
    await seedSuperAdmin();
    // Start server
    server = app.listen(envVars.PORT, () => {
      logger.info(`Application running on port ${envVars.PORT}`);
    });

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle unexpected errors
    process.on('uncaughtException', async error => {
      errorlogger.error('Uncaught Exception:', error);
      await shutdown('uncaughtException');
    });

    process.on('unhandledRejection', async error => {
      errorlogger.error('Unhandled Rejection:', error);
      await shutdown('unhandledRejection');
    });
  } catch (error) {
    errorlogger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
