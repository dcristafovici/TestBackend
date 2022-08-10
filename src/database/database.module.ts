import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'admin',
      password: 'admin',
      database: 'TestDB',
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
