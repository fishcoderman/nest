import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { LogMiddleware } from './about.middleware';

@Module({
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('about/user*');
  }
}
