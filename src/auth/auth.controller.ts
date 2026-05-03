import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  StudentLoginDto,
  RefreshDto,
  ChangePasswordDto,
  ForgotPasswordDto,
} from './auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('x-client-type') clientType: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    if (clientType === 'web') {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 4 * 24 * 60 * 60 * 1000,
      });
      const { refreshToken, ...rest } = result;
      return rest;
    }

    return result;
  }

  @Public()
  @Post('login/student')
  studentLogin(
    @Body() dto: StudentLoginDto,
    @Headers('user-agent') deviceInfo?: string,
  ) {
    return this.authService.studentLogin(dto, deviceInfo);
  }

  @Get('dashboard')
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.authService.getDashboard(user);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Headers('x-client-type') clientType: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies;
    if (!cookies.refreshToken || typeof cookies.refreshToken !== 'string')
      return;
    const refreshToken =
      clientType === 'web' ? cookies.refreshToken : dto.refreshToken;

    const result = await this.authService.refresh({ refreshToken });

    if (clientType === 'web') {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 4 * 24 * 60 * 60 * 1000,
      });
      const { refreshToken: _, ...rest } = result;
      return rest;
    }

    return result;
  }

  @Post('change-password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('logout')
  async logout(
    @Body() dto: RefreshDto,
    @Headers('x-client-type') clientType: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies;
    if (!cookies.refreshToken || typeof cookies.refreshToken !== 'string')
      return;
    const refreshToken =
      clientType === 'web' ? cookies.refreshToken : dto.refreshToken;
    if (clientType === 'web') {
      res.clearCookie('refreshToken');
    }

    return this.authService.logout(refreshToken);
  }

  @Post('logout/all')
  logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.logoutAll(user.sub);
  }
}
