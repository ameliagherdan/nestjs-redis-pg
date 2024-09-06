import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.tasksService.createTask(createTaskDto);
    return {
      message: 'Task created successfully',
      task,
    };
  }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const updatedTask = await this.tasksService.updateTask(id, updateTaskDto);
    return {
      message: 'Task updated successfully',
      updatedTask,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTask(@Param('id') id: string) {
    await this.tasksService.deleteTask(id);
  }
}
