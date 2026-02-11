import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Inicializa a aplicação Nest com validações globais e CORS para o frontend local.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);

  // Remove campos inesperados e aplica transformação automática dos DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Libera chamadas do frontend Angular em desenvolvimento.
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: '*',
    allowedHeaders: '*',
  });

  await app.listen(port);
}
bootstrap();
