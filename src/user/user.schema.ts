import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  // Teachers and admins only
  @Prop({
    trim: true,
    lowercase: true,
    sparse: true, // allows null for students
    unique: true,
  })
  email?: string;

  // Teachers and admins only
  @Prop()
  password?: string;

  // Students only — 4-digit PIN stored as string
  @Prop()
  pin?: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  // Students only
  @Prop({ type: Types.ObjectId, ref: 'ClassModel', sparse: true })
  classId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
