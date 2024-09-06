import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findUserByUsername(username);

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
  
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    return this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
    
      const user = await this.usersService.findUserById(decoded.sub);
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const payload = { username: user.username, sub: user.id };
      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      return { access_token: newAccessToken };
      
    } catch (err) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  logAuditEvent(event: string, userId: string) {
    console.log(`Audit Log: ${event} - User: ${userId}`);
  }
}
