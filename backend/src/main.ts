import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createValidationPipe } from './validation';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: allowedOrigins, methods: '*', allowedHeaders: '*' });
  app.useGlobalPipes(createValidationPipe());
  await app.listen(port);
}
void bootstrap();
