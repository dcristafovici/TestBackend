import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsEmail()
  password: string;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
