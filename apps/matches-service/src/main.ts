import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { MatchesServiceModule } from './matches-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(MatchesServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.MATCHES_SERVICE_PORT ?? 3001),
    },
  });

  await app.listen();
}
bootstrap();
