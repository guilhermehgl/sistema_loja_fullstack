import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
  const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
  const server = app.getHttpAdapter().getInstance();

  server.get('/', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Backend online',
    });
  });

  app.enableCors({
    origin: allowedOrigins,
    methods: '*',
    allowedHeaders: '*',
  });

  await app.listen(port);
}
bootstrap();
