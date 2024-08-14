import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Ip,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { LoginGuard } from './about.guard';
import { TimeInterceptor } from './about.interceptor';
import { ValidatePipe } from './about.pipe';

function Test(a: number) {
  console.info('aa', a);
  function logMethod(target, name, descriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args) {
      console.log(`Calling ${name} with arguments:`, args);
      return original.apply(this, args);
    };
    return descriptor;
  }
  return logMethod;
}

class MyClass {
  @Test(111)
  myMethod(a, b) {
    return a + b;
  }
}

const instance = new MyClass();
console.log(instance.myMethod(1, 22));

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  findAll() {
    return this.aboutService.findAll();
  }

  @Get('user')
  getUser(): any {
    console.log('user info ...');
    return {
      name: 'tom',
      age: 28,
    };
  }

  @Get('guards')
  @UseGuards(LoginGuard)
  loginGuard(): any {
    console.log('LoginGuard ...');
    return {
      name: 'tom',
      age: 28,
    };
  }

  @Get('timeInterceptor')
  @UseInterceptors(TimeInterceptor)
  timeInterceptor(): any {
    console.log('timeInterceptor ...');
    return {
      name: 'tom',
      age: 28,
    };
  }

  @Get('pipe')
  pipe(@Query('num', ValidatePipe) num: number) {
    console.log('num:', num);
    return {
      name: 'tom',
      age: num,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Ip() ip: string) {
    console.info('ip:', ip);
    return this.aboutService.findOne(+id);
  }

  @Post('post/:id')
  create(@Param('id') id: string, @Body() createAboutDto: CreateAboutDto) {
    console.info('post', id, createAboutDto?.name);
    return this.aboutService.create(createAboutDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAboutDto: UpdateAboutDto) {
    console.info('isd', id, updateAboutDto);
    return this.aboutService.update(+id, updateAboutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aboutService.remove(+id);
  }
}
