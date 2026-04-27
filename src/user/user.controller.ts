import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateStudentDto,
  CreateTeacherDto,
  ResetPasswordDto,
  ResetPinDto,
  UpdateUserDto,
} from './user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from './user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.userService.createTeacher(dto);
  }

  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.userService.createStudent(dto);
  }

  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.userService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/reset-pin')
  resetPin(@Param('id') id: string, @Body() dto: ResetPinDto) {
    return this.userService.resetPin(id, dto);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.toggleActive(id, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.remove(id, user.sub);
  }
}
