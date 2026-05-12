import { NestFactory } from '@nestjs/core';
import { TournamentsServiceModule } from './tournaments-service.module';

async function bootstrap() {
  const app = await NestFactory.create(TournamentsServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
