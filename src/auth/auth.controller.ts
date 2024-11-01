// auth/auth.controller.ts
import { Controller, Post, Body, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const result = await this.authService.signUp(signUpDto);
    return res.status(201).json(result);
  }

  @Post('sign-in')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const result = await this.authService.signIn(signInDto);
    return res.status(200).json(result);
  }

  @Post('send-password-reset-link')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendPasswordResetLink(@Body('email') email: string, @Res() res: Response) {
    const result = await this.authService.sendPasswordResetLink(email);
    return res.status(200).json(result);
  }

  @Post('validate-reset-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateResetToken(@Query('token') token: string, @Res() res: Response) {
    const result = await this.authService.validateResetToken(token);
    return res.status(200).json(result);
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return res.status(200).json(result);
  }
}
