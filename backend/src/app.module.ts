import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Specifies that you're using PostgreSQL
      host: 'localhost', // The address of your database server
      port: 5432, // The port of your PostgreSQL server
      username: 'postgres', // Your PostgreSQL username
      password: 'postgres', // Your PostgreSQL password
      database: 'postgres', // The name of your database
      entities: [], // This is where your entities (tables) would go
      synchronize: true, // In development, it can be true to synchronize the database schema automatically
    }),
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
