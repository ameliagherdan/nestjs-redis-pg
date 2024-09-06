import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/database/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findUserById: jest.fn(),
            findUserByUsername: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'testpassword',
      email: 'test@example.com',
    };

    const user = new User();
    user.id = '1';
    user.username = createUserDto.username;
    user.password = createUserDto.password;

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(user);

    const result = await service.createUser(createUserDto);
    expect(result).toEqual(user);
  });

  it('should find a user by ID', async () => {
    const user = new User();
    user.id = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue(user);

    const result = await service.findUserById('1');
    expect(result).toEqual(user);
  });

  it('should find a user by username', async () => {
    const user = new User();
    user.username = 'testuser';

    jest.spyOn(userRepository, 'findUserByUsername').mockResolvedValue(user);

    const result = await service.findUserByUsername('testuser');
    expect(result).toEqual(user);
  });

  it('should delete a user', async () => {
    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(true);

    const result = await service.deleteUser('1');
    expect(result).toEqual(true);
  });
});
