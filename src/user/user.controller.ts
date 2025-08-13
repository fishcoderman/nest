import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Inject,
  Res,
  Headers,
  UseGuards,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginGuard } from './login.guard';
import { Result } from '../common/result';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('info')
  @UseGuards(LoginGuard)
  getUserInfo(@Req() req) {
    return Result.success(req.user, '获取用户信息成功');
  }

  @Get('home')
  @UseGuards(LoginGuard)
  aaa() {
    return 'aaa';
  }

  @Get(':id')
  @UseGuards(LoginGuard)
  async getUserById(@Param('id') id: string) {
    console.info('id', id);
    try {
      return await this.userService.getUserById(id);
    } catch (error) {
      // 如果是 HttpException，直接抛出
      if (error.status) {
        throw error;
      }
      // 其他错误统一处理
      throw new UnauthorizedException('获取用户信息失败');
    }
  }

  @Get()
  @UseGuards(LoginGuard)
  async getUserPage(@Query() getUsersDto: GetUsersDto) {
    return await this.userService.getUsers(getUsersDto);
  }

  @Post('register')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async register(@Body() user: RegisterDto) {
    try {
      return await this.userService.register(user);
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new UnauthorizedException('注册过程中发生错误');
    }
  }

  @Put(':id')
  @UseGuards(LoginGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: true, // 允许部分更新
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      // 如果是 HttpException，直接抛出
      if (error.status) {
        throw error;
      }
      // 其他错误统一处理
      throw new UnauthorizedException('更新用户信息失败');
    }
  }

  @Delete(':id')
  @UseGuards(LoginGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      // 如果是 HttpException，直接抛出
      if (error.status) {
        throw error;
      }
      // 其他错误统一处理
      throw new UnauthorizedException('删除用户失败');
    }
  }

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async login(
    @Body() user: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const foundUser = await this.userService.login(user);

      if (foundUser) {
        const token = await this.jwtService.signAsync({
          user: {
            id: foundUser.id,
            username: foundUser.username,
          },
        });
        res.setHeader('token', token);
        return Result.success(
          {
            id: foundUser.id,
            username: foundUser.username,
          },
          '登录成功',
        );
      } else {
        throw new UnauthorizedException('登录失败');
      }
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new UnauthorizedException('登录过程中发生错误');
    }
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
