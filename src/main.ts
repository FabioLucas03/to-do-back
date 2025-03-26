import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Configure validation pipe with improved options
  app.useGlobalPipes(new ValidationPipe({
    transform: true, 
    transformOptions: { 
      enableImplicitConversion: true,
    },
    whitelist: false,
    forbidNonWhitelisted: false,
    // Skip the date validation for deadline
    validationError: { target: false, value: false },
    skipMissingProperties: false,
  }));
  
  // Configure CORS to allow frontend requests
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  
  // Add global API prefix
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 8080);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
