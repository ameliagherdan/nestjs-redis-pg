import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { RedisService } from './common/services/redis.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import ormconfig from 'ormconfig';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    UsersModule,
    TasksModule,
    DatabaseModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [RedisService],
})
export class AppModule {}
