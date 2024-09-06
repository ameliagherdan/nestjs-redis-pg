import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return this.userRepository.createUser(createUserDto);
    }

    async findUserById(id: string): Promise<User> {
        return this.userRepository.findUserById(id);
    }

    async findAllUsers(): Promise<User[]> {
        return this.userRepository.findAllUsers();
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        await this.userRepository.updateUser(id, updateUserDto);
        return this.findUserById(id);
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await this.userRepository.deleteUser(id);
        return result;
    }

    async findUserByUsername(username: string): Promise<User> {
        return this.userRepository.findUserByUsername(username);
    }
}
