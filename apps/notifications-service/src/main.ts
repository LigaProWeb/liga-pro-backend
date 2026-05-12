import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationsServiceModule } from './notifications-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationsServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.NOTIFICATIONS_SERVICE_PORT ?? 3002),
    },
  });

  await app.listen();
}
bootstrap();
