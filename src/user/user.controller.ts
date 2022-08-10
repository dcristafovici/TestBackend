import { Controller, Get, Post } from '@nestjs/common';
import { UserRegisterModel } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  async getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  @Post('/create')
  async registerUser(data: UserRegisterModel): Promise<User> {
    return this.userService.register(data);
  }
}
