// auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Credential } from './schemas/credential.schema';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Credential.name) private credentialModel: Model<Credential>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const { name, email, password } = signUpDto;
    
    const existingUser = await this.credentialModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid(20);

    const newUser = new this.credentialModel({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();

    // Comment out for testing purposes
    // await this.sendWelcomeEmail(email, name, verificationToken);

    const payload = { email: newUser.email };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });

    return {
      message: 'User registered successfully',
      accessToken,
      refreshToken,
    };
  }

  async signIn(signInDto: SignInDto): Promise<any> {
    const { email, password } = signInDto;

    const user = await this.credentialModel.findOne({ email }).exec();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });

    return {
      message: 'User signed in successfully',
      accessToken,
      refreshToken,
      user,
    };
  }

  async sendPasswordResetLink(email: string): Promise<any> {
    const user = await this.credentialModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const resetToken = nanoid(20);
    user.forgotPassToken = resetToken;
    await user.save();

    // Comment out for testing purposes
    // await this.sendResetPasswordEmail(email, resetToken);

    return {
      message: 'Password reset link sent successfully',
      resetLink: resetToken,
    };
  }

  async validateResetToken(token: string): Promise<any> {
    const user = await this.credentialModel.findOne({ forgotPassToken: token }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    return { message: 'Reset token is valid' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    const { email, password, newPassword } = forgotPasswordDto;

    const user = await this.credentialModel.findOne({ email }).exec();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
  }

  private async sendWelcomeEmail(email: string, name: string, token: string) {
    // Implement email sending logic
  }

  private async sendResetPasswordEmail(email: string, token: string) {
    // Implement email sending logic
  }
}
