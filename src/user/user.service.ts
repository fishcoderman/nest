import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';

function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  async login(user: LoginDto) {
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (!foundUser) {
      throw new HttpException('用户名不存在', 200);
    }
    if (foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', 200);
    }
    return foundUser;
  }

  async register(user: RegisterDto) {
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', 200);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async getUsers(getUsersDto: GetUsersDto) {
    const { page = 1, limit = 10, keyword } = getUsersDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 如果有搜索关键词，添加搜索条件
    if (keyword) {
      queryBuilder.where('user.username LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // 添加分页
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createTime', 'DESC');

    // 执行查询并获取总数
    const [users, total] = await queryBuilder.getManyAndCount();

    // 移除密码字段
    const safeUsers = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return {
      data: safeUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  async getUserById(id: string) {
    // 验证 ID 格式
    if (!id || isNaN(Number(id))) {
      throw new HttpException('无效的用户ID', 400);
    }

    const userId = Number(id);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'createTime', 'updateTime'], // 明确指定不包含密码
      });

      if (!user) {
        throw new HttpException('用户不存在', 404);
      }

      return {
        success: true,
        data: user,
        message: '获取用户信息成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`获取用户信息失败: ${error.message}`, UserService);
      throw new HttpException('获取用户信息失败', 500);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    // 验证 ID 格式
    if (!id || isNaN(Number(id))) {
      throw new HttpException('无效的用户ID', 400);
    }

    const userId = Number(id);

    try {
      // 检查用户是否存在
      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new HttpException('用户不存在', 404);
      }

      // 如果要更新用户名，检查新用户名是否已被使用
      if (
        updateUserDto.username &&
        updateUserDto.username !== existingUser.username
      ) {
        const usernameExists = await this.userRepository.findOne({
          where: { username: updateUserDto.username },
        });

        if (usernameExists) {
          throw new HttpException('用户名已存在', 409);
        }
      }

      // 准备更新数据
      const updateData: Partial<User> = {};

      if (updateUserDto.username) {
        updateData.username = updateUserDto.username;
      }

      if (updateUserDto.password) {
        updateData.password = md5(updateUserDto.password);
      }

      // 如果没有任何更新数据
      if (Object.keys(updateData).length === 0) {
        throw new HttpException('没有提供需要更新的数据', 400);
      }

      // 执行更新
      await this.userRepository.update(userId, updateData);

      // 返回更新后的用户信息（不包含密码）
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'createTime', 'updateTime'],
      });

      return {
        success: true,
        data: updatedUser,
        message: '用户信息更新成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`更新用户信息失败: ${error.message}`, UserService);
      throw new HttpException('更新用户信息失败', 500);
    }
  }

  async deleteUser(id: string) {
    // 验证 ID 格式
    if (!id || isNaN(Number(id))) {
      throw new HttpException('无效的用户ID', 400);
    }

    const userId = Number(id);

    try {
      // 检查用户是否存在
      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username'],
      });

      if (!existingUser) {
        throw new HttpException('用户不存在', 400);
      }

      // 执行软删除或硬删除
      const result = await this.userRepository.delete(userId);

      if (result.affected === 0) {
        throw new HttpException('删除用户失败', 500);
      }

      return {
        success: true,
        message: `用户 "${existingUser.username}" 删除成功`,
        data: {
          id: existingUser.id,
          username: existingUser.username,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`删除用户失败: ${error.message}`, UserService);
      throw new HttpException('删除用户失败', 500);
    }
  }
}
