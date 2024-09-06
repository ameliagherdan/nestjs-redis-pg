import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [RedisService, LoggingInterceptor],
  exports: [RedisService],
})
export class CommonModule {}
