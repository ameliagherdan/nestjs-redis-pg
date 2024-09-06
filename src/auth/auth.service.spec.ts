import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByUsername: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate a user', async () => {
    const user = new User();
    user.username = 'testuser';
    user.password = await bcrypt.hash('testpassword', 10);

    jest.spyOn(usersService, 'findUserByUsername').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.validateUser('testuser', 'testpassword');
    expect(result).toEqual(user);
  });

  it('should return null if validation fails', async () => {
    jest.spyOn(usersService, 'findUserByUsername').mockResolvedValue(null);

    const result = await service.validateUser('invaliduser', 'invalidpassword');
    expect(result).toBeNull();
  });

  it('should login a user and return a JWT', async () => {
    const user = new User();
    user.id = '1';
    user.username = 'testuser';

    jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

    const result = await service.login(user);
    expect(result).toEqual({ access_token: 'jwt_token' });
  });

  it('should register a new user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      password: 'newpassword',
      email: 'new@example.com',
    };

    const user = new User();
    user.id = '1';
    user.username = createUserDto.username;

    jest.spyOn(usersService, 'createUser').mockResolvedValue(user);

    const result = await service.register(createUserDto);
    expect(result).toEqual(user);
  });
});
