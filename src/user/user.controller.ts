import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Res,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginGuard } from './login.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('home')
  @UseGuards(LoginGuard)
  aaa() {
    return 'aaa';
  }

  @Get('about')
  @UseGuards(LoginGuard)
  bbb() {
    return 'bbb';
  }

  @Post('login')
  async login(
    @Body() user: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const foundUser = await this.userService.login(user);

    if (foundUser) {
      const token = await this.jwtService.signAsync({
        user: {
          id: foundUser.id,
          username: foundUser.username,
        },
      });
      res.setHeader('token', token);
      return 'login success';
    } else {
      return 'login fail';
    }
  }

  @Post('register')
  async register(@Body() user: RegisterDto) {
    return await this.userService.register(user);
  }

  @Get('analysis')
  analysis(
    @Headers('authorization') authorization: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (authorization) {
      console.info('authorization', authorization);
      try {
        const token = authorization.split(' ')[1];
        const data = this.jwtService.verify(token);
        console.info('data', data);
        const newToken = this.jwtService.sign({
          count: data.count + 1,
        });
        response.setHeader('token', newToken);
        return data.count + 1;
      } catch (e) {
        console.log(e);
        throw new UnauthorizedException();
      }
    } else {
      const newToken = this.jwtService.sign({
        count: 1,
      });
      response.setHeader('token', newToken);
      return 1;
    }
  }
}
