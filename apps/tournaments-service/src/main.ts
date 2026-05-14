import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { TournamentsServiceModule } from './tournaments-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(TournamentsServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.TOURNAMENTS_SERVICE_PORT ?? 3004),
    },
  });

  await app.listen();
}
bootstrap();
