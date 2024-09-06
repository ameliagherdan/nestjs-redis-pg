import { 
    Controller, 
    Get, 
    Param, 
    Patch, 
    Body, 
    Delete, 
    NotFoundException, 
    HttpCode, 
    HttpStatus 
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { User } from 'src/database/entities/user.entity';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
      const user = await this.usersService.findUserById(id);
  
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
  
      return user;
    }
  
    // Get all users
    @Get()
    async findAll(): Promise<User[]> {
      return this.usersService.findAllUsers();
    }
  
  
    @Patch(':id')
    async updateUser(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);
  
      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
  
      return updatedUser;
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id') id: string): Promise<void> {
      const result = await this.usersService.deleteUser(id);
  
      if (!result) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
    }
  }
  