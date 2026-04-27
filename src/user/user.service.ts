import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './user.schema';
import {
  CreateStudentDto,
  CreateTeacherDto,
  ResetPasswordDto,
  ResetPinDto,
  UpdateUserDto,
} from './user.dto';
import { Session, SessionDocument } from '../auth/session.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async createTeacher(dto: CreateTeacherDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password,
      role: UserRole.TEACHER,
      isActive: true,
    });

    return this.sanitize(user);
  }

  async createStudent(dto: CreateStudentDto) {
    const pin = await bcrypt.hash(dto.pin, 10);
    const user = await this.userModel.create({
      name: dto.name.toLocaleLowerCase(),
      pin,
      classId: dto.classId,
      role: UserRole.STUDENT,
      isActive: true,
    });

    return this.sanitize(user);
  }

  async findAll(role?: UserRole) {
    return this.userModel
      .find(role ? { role } : {})
      .select('-password -pin')
      .populate('classId', 'name')
      .lean();
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -pin')
      .populate('classId', 'name')
      .lean();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password -pin');

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async resetPin(id: string, dto: ResetPinDto) {
    const pin = await bcrypt.hash(dto.pin, 10);
    const user = await this.userModel.findByIdAndUpdate(id, { pin });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'PIN reset successfully' };
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.findByIdAndUpdate(id, { password });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Password reset successfully' };
  }

  async toggleActive(id: string, requestingUserId: string) {
    if (requestingUserId === id) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    if (!user.isActive) {
      await this.sessionModel.deleteMany({ userId: id });
    }

    await user.save();
    return { message: `User ${user.isActive ? 'activated' : 'deactivated'}` };
  }

  async remove(id: string, requestingUserId: string) {
    if (requestingUserId === id) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted' };
  }

  private sanitize(user: UserDocument) {
    const { password, pin, ...obj } = user.toObject() as {
      password?: string;
      pin?: string;
      [key: string]: unknown;
    };
    return obj;
  }
}
