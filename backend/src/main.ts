import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('SERVER_PORT') || 3000;
  const host = configService.get('SERVER_HOST') || '127.0.0.1';

  const config = new DocumentBuilder()
    .setTitle('Hedera Multisignature Backend API')
    .setDescription('The Hedera Multisignature Backend API description')
    .setVersion('1.0.0')
    .addTag('Transactions', 'Hedera Multisignature Transactions')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
