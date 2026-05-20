import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.USERS_SERVICE_PORT ?? 3005),
    },
  });

  await app.listen();
}
bootstrap();
