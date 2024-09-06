import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../database/entities/task.entity';
import { RedisService } from '../common/services/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly redisService: RedisService,
  ) {}

  private cacheKeyPrefix = 'task_';

  async findOne(id: string): Promise<Task> {
    const cacheKey = `${this.cacheKeyPrefix}${id}`;
    const cachedTask = await this.redisService.get(cacheKey);

    if (cachedTask) {
      return JSON.parse(cachedTask);
    }

    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.redisService.setWithExpiry(cacheKey, JSON.stringify(task), 3600);
    return task;
  }

  async findAll(): Promise<Task[]> {
    const cacheKey = `${this.cacheKeyPrefix}all`;
    const cachedTasks = await this.redisService.get(cacheKey);

    if (cachedTasks) {
      return JSON.parse(cachedTasks);
    }

    const tasks = await this.taskRepository.find();
    await this.redisService.setWithExpiry(cacheKey, JSON.stringify(tasks), 3600);
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    const savedTask = await this.taskRepository.save(task);
    
    await this.redisService.delete(`${this.cacheKeyPrefix}all`);
  
    return savedTask;
  }
  

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    const cacheKey = `${this.cacheKeyPrefix}${id}`;
    await this.redisService.setWithExpiry(cacheKey, JSON.stringify(updatedTask), 3600);
    await this.redisService.delete(`${this.cacheKeyPrefix}all`);

    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const cacheKey = `${this.cacheKeyPrefix}${id}`;
    await this.redisService.delete(cacheKey);
    await this.redisService.delete(`${this.cacheKeyPrefix}all`);
  }
}
