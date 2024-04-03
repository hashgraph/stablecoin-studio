/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //! TODO: REVIEW THIS
  app.enableCors();
  app.enableCors({
    origin: 'http://127.0.0.1:3000',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

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
