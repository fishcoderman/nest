import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { NextFunction } from 'express';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ResponseInterceptor } from './common/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

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
