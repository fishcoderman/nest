import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 全局中间件
  app.use(function (req: Request, res: Response, next: NextFunction) {
    // console.log('before', req.url);
    next();
    // console.log('after');
  });

  app.useStaticAssets('public', { prefix: '/static' });

  await app.listen(8080);
}
bootstrap();
