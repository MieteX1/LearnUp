import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express'; 
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(express.json());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  
  app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(3000);

}
bootstrap();







