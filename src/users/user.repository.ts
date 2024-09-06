import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // Create a new user with hashed password
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.repository.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.repository.save(user);
  }

  // Find a user by ID
  async findUserById(id: string): Promise<User> {
    return this.repository.findOne({ where: { id } });
  }

  // Find a user by username
  async findUserByUsername(username: string): Promise<User> {
    return this.repository.findOne({ where: { username } });
  }

  // Find all users
  async findAllUsers(): Promise<User[]> {
    return this.repository.find();
  }

  // Update a user by ID
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (user) {
      Object.assign(user, updateUserDto);  // Merge updated fields into the user object
      return this.repository.save(user);  // Save the updated user
    }

    return null;
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;  // Return true if a row was deleted
  }

  // Save a user (for reusable operations like update or create)
  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
