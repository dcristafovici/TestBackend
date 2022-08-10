import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
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

    const emailExists = await this.userRepository.findOne({ where: { email } });
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

    return this.userRepository.save({ ...information, password });
  }

  getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async validate(data: UserLoginModel): Promise<any> {
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

    const { password: existedUserPassword, ...result } = existedUser;
    return result;
  }

  async login(user: UserLoginModel) {
    const validatedUser = await this.validate(user);
    if (validatedUser) {
      return {
        access_token: jwt.sign(validatedUser, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '60s',
        }),
        refresh_token: jwt.sign(
          validatedUser,
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: '600s',
          },
        ),
      };
    }
  }

  verifyToken = ({ access_token }) => {
    return jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              message: 'Invalid credentials.',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
        return decoded;
      },
    );
  };

  verifyRefreshToken = ({ refresh_token }) => {
    return jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              message: 'Invalid credentials.',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
        const { iat, exp, ...user } = decoded;
        return {
          access_token: jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '60s',
          }),
          refresh_token: jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '600s',
          }),
        };
      },
    );
  };
}
