import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../database/entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { RedisService } from '../common/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService, RedisService],
})
export class TasksModule {}
