import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Chỉ lắng nghe cổng nếu không phải môi trường Vercel
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }

  await app.init();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return app.getHttpAdapter().getInstance();
}

export default bootstrap();
