import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutModule } from './about/about.module';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user/entities/user.entity';
import { FoodModule } from './food/food.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'zt123456',
      database: 'my_new_db',
      synchronize: true,
      logging: true,
      entities: [User],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugins: 'sha256_password',
      },
    }),
    JwtModule.register({
      global: true,
      secret: 'tao',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    AboutModule,
    FileModule,
    UserModule,
    FoodModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
