import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRegisterModel } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(data: UserRegisterModel): Promise<User> {
    const { email, password: unencryptedPassword } = data;

    const emailExists = await this.userRepository.findBy({ email });
    if (emailExists) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'This email is already registered.',
        },
        HttpStatus.CONFLICT,
      );
    }

    const password = await bcrypt.hash(unencryptedPassword, 10);

    return this.userRepository.save({ email, password, ...data });
  }

  getAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
