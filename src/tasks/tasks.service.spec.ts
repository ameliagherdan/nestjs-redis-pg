import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task } from 'src/database/entities/task.entity';
import { RedisService } from '../common/services/redis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            setWithExpiry: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    redisService = module.get<RedisService>(RedisService);
  });

  describe('findOne', () => {
    it('should return a task from Redis if cached', async () => {
      const task = new Task();
      task.id = '1';
      task.title = 'Test Task';
      
      jest.spyOn(redisService, 'get').mockResolvedValue(JSON.stringify(task));

      const result = await service.findOne('1');
      expect(result).toEqual(task);
    });

    it('should return a task from the database if not cached', async () => {
      const task = new Task();
      task.id = '1';
      task.title = 'Test Task';

      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(task);

      const result = await service.findOne('1');
      expect(result).toEqual(task);
      expect(redisService.setWithExpiry).toHaveBeenCalledWith('task_1', JSON.stringify(task), 3600);
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all tasks from Redis if cached', async () => {
      const tasks = [new Task(), new Task()];
      jest.spyOn(redisService, 'get').mockResolvedValue(JSON.stringify(tasks));

      const result = await service.findAll();
      expect(result).toEqual(tasks);
    });

    it('should return all tasks from the database if not cached', async () => {
      const tasks = [new Task(), new Task()];
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(taskRepository, 'find').mockResolvedValue(tasks);

      const result = await service.findAll();
      expect(result).toEqual(tasks);
      expect(redisService.setWithExpiry).toHaveBeenCalledWith('task_all', JSON.stringify(tasks), 3600);
    });
  });

  describe('createTask', () => {
    it('should create and return a new task', async () => {
      const createTaskDto: CreateTaskDto = { title: 'Test Task', description: 'Test Description' };
      const task = new Task();
      task.id = '1';
      task.title = createTaskDto.title;
      task.description = createTaskDto.description;
  
      jest.spyOn(taskRepository, 'create').mockReturnValue(task);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(task);
  
      const result = await service.createTask(createTaskDto);
      expect(result).toEqual(task);
      expect(redisService.delete).toHaveBeenCalledWith('task_all');
    });
  });
  

  describe('updateTask', () => {
    it('should update a task and return the updated task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task', completed: true };
      const task = new Task();
      task.id = '1';
      task.title = 'Old Task';
      task.completed = false;
  
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(task);
      jest.spyOn(taskRepository, 'save').mockResolvedValue({ ...task, ...updateTaskDto });
  
      const result = await service.updateTask('1', updateTaskDto);
      expect(result.title).toEqual(updateTaskDto.title);
      expect(result.completed).toEqual(updateTaskDto.completed);
      expect(redisService.setWithExpiry).toHaveBeenCalledWith('task_1', JSON.stringify(result), 3600);
      expect(redisService.delete).toHaveBeenCalledWith('task_all');
    });
  
    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);
  
      await expect(service.updateTask('1', { title: 'Updated Task', completed: true }))
        .rejects.toThrow(NotFoundException);
    });
  });
  

  describe('deleteTask', () => {
    it('should delete a task and invalidate cache', async () => {
        jest.spyOn(taskRepository, 'delete').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(redisService, 'delete').mockResolvedValue(null);
  
      await service.deleteTask('1');
      expect(redisService.delete).toHaveBeenCalledWith('task_1');
      expect(redisService.delete).toHaveBeenCalledWith('task_all');
    });
  
    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'delete').mockResolvedValue({ affected: 0 } as any);
  
      await expect(service.deleteTask('1')).rejects.toThrow(NotFoundException);
    });
  });  
});
