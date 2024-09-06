import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategies/local-auth.strategy';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from 'src/database/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    const user: User = req.user;
    const tokens = await this.authService.login(user);
    
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
      },
      ...tokens,
    };
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    
    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
