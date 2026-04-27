import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { User, UserDocument, UserRole } from '../user/user.schema';
import { Session, SessionDocument } from './session.schema';
import { JwtPayload } from '../common/types/jwt-payload.type';
import {
  LoginDto,
  StudentLoginDto,
  RefreshDto,
  ChangePasswordDto,
  ForgotPasswordDto,
} from './auth.dto';
import { Note, NoteDocument } from '../note/note.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,

    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,

    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, deviceInfo?: string) {
    const user = await this.userModel.findOne({
      email: dto.email,
      role: { $in: [UserRole.ADMIN, UserRole.TEACHER] },
      isActive: true,
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password!))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSession(user, deviceInfo);
  }

  async studentLogin(dto: StudentLoginDto, deviceInfo?: string) {
    const user = await this.userModel.findOne({
      name: dto.name.toLocaleLowerCase(),
      role: UserRole.STUDENT,
      isActive: true,
    });

    if (!user || !(await bcrypt.compare(dto.pin, user.pin!))) {
      throw new UnauthorizedException('Invalid name or PIN');
    }

    return this.createSession(user, deviceInfo);
  }

  async getDashboard(user: JwtPayload) {
    if (user.role === UserRole.ADMIN) {
      const [teachers, students, notes] = await Promise.all([
        this.userModel.countDocuments({
          role: UserRole.TEACHER,
          isActive: true,
        }),
        this.userModel.countDocuments({
          role: UserRole.STUDENT,
          isActive: true,
        }),
        this.noteModel.countDocuments(),
      ]);

      return {
        role: user.role,
        name: user.name,
        stats: { teachers, students, notes },
      };
    }

    // Teacher — just basic info for now
    return {
      role: user.role,
      name: user.name,
    };
  }

  async refresh(dto: RefreshDto) {
    const session = await this.sessionModel.findOne({
      refreshToken: dto.refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await session.deleteOne();
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      await session.deleteOne();
      throw new UnauthorizedException('Malformed refresh token');
    }

    const user = await this.userModel.findById(session.userId);

    if (!user || !user.isActive) {
      await session.deleteOne();
      throw new ForbiddenException('Account not allowed');
    }

    await session.deleteOne();
    return this.createSession(user, session.deviceInfo);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { oldPassword, newPassword } = dto;
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('Invalid email');
    if (!user.password)
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      );
    const verified = await bcrypt.compare(oldPassword, user.password);
    if (!verified) throw new UnauthorizedException('Incorrect password');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await this.sessionModel.deleteMany({ userId });
    return { message: 'Password changed' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { recoveryCode, email, password } = dto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Invalid email');
    const code = this.config.get<string>('RECOVERY_CODE');
    if (recoveryCode !== code)
      throw new BadRequestException('Incorrect recovery code');

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await this.sessionModel.deleteMany({ userId: user._id });
    return { message: 'Password changed' };
  }

  async logout(refreshToken: string) {
    await this.sessionModel.deleteOne({ refreshToken });
    return { message: 'Logged out' };
  }

  async logoutAll(userId: string) {
    await this.sessionModel.deleteMany({ userId });
    return { message: 'Logged out from all devices' };
  }

  private async createSession(user: UserDocument, deviceInfo?: string) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      role: user.role,
      name: user.name,
    };
    const MAX_SESSIONS = 5;

    const sessions = await this.sessionModel
      .find({ userId: user._id })
      .sort({ createdAt: 1 }); // oldest first

    if (sessions.length >= MAX_SESSIONS) {
      const excess = sessions.length - MAX_SESSIONS + 1;

      const toDelete = sessions.slice(0, excess);

      await this.sessionModel.deleteMany({
        _id: { $in: toDelete.map((s) => s._id) },
      });
      await this.sessionModel.deleteMany({
        _id: { $in: toDelete.map((s) => s._id) },
      });
    }
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync<JwtPayload>(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshExpiry(user.role),
    });

    const expiresAt = this.getRefreshExpiryDate(user.role);

    await this.sessionModel.create({
      userId: user._id,
      refreshToken,
      deviceInfo,
      expiresAt,
    });

    return { accessToken, refreshToken, user: payload };
  }

  private getRefreshExpiry(role: UserRole) {
    switch (role) {
      case UserRole.ADMIN:
        return '4d';
      case UserRole.TEACHER:
        return '7d';
      case UserRole.STUDENT:
        return '30d';
    }
  }

  private getRefreshExpiryDate(role: UserRole): Date {
    const ms: Record<UserRole, number> = {
      [UserRole.ADMIN]: 3 * 24 * 60 * 60 * 1000,
      [UserRole.TEACHER]: 7 * 24 * 60 * 60 * 1000,
      [UserRole.STUDENT]: 30 * 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + ms[role]);
  }
}
