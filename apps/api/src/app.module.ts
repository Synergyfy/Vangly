import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { envValidationSchema } from './config/env.validation';
import { loggerOptions } from './infra/logger/logger.config';
import { throttlerOptions } from './infra/throttler/throttler.config';
import { AppThrottlerGuard } from './common/guards/throttler.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { OrgAuditModule } from './infra/audit/org-audit.module';
import { SmsModule } from './infra/sms/sms.module';
import { JobsModule } from './infra/jobs/jobs.module';
import { StorageModule } from './infra/storage/storage.module';
import { LocationsModule } from './modules/locations/locations.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MembersModule } from './modules/members/members.module';
import { FormsModule } from './modules/forms/forms.module';
import { PublicFormsModule } from './modules/public-forms/public-forms.module';
import { JobsModule as JobsControllerModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    LoggerModule.forRoot(loggerOptions()),
    ThrottlerModule.forRoot(throttlerOptions()),
    DatabaseModule,
    AuthModule,
    OrgAuditModule,
    SmsModule,
    JobsModule,
    StorageModule,
    LocationsModule,
    TeamsModule,
    MembersModule,
    FormsModule,
    PublicFormsModule,
    JobsControllerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
