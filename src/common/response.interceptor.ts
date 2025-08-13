import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from './result';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是 Result 实例，直接返回
        if (data instanceof Result) {
          // 如果没有设置 path，则添加请求路径
          if (!data.path) {
            data.path = request.url;
          }
          return data;
        }

        // 否则包装成 Result 格式
        return Result.success(data, '操作成功', request.url);
      }),
    );
  }
}
