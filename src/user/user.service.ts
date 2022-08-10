import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserLoginModel, UserRegisterModel } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(data: UserRegisterModel): Promise<User> {
    const { password: unencryptedPassword, ...information } = data;
    const { email } = information;

    const emailExists = await this.userRepository.findBy({ email });
    if (emailExists.length) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'This email is already registered.',
        },
        HttpStatus.CONFLICT,
      );
    }

    const password = await bcrypt.hash(unencryptedPassword, 10);

    return this.userRepository.save({ ...information, password });
  }

  getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async login(data: UserLoginModel): Promise<User> {
    const { password, email } = data;

    const existedUser: User = await this.userRepository.findOne({
      where: { email },
    });

    if (!existedUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not registered.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const matchPassword = await bcrypt.compare(password, existedUser.password);

    if (!matchPassword) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.userRepository.findOne({ where: { email } });
  }
}
