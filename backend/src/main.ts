import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
  const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: '*',
    allowedHeaders: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const details = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );

        return new BadRequestException({
          message: 'Dados inválidos enviados para a API.',
          errors: details,
        });
      },
    }),
  );

  await app.listen(port);
}
void bootstrap();
