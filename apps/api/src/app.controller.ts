import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles, RolesGuard } from './auth/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  @Get('api/worker-only')
  @UseGuards(RolesGuard)
  @Roles('worker')
  getWorkerData() {
    return { message: 'Access granted to worker' };
  }

  @Get('api/admin-only')
  @UseGuards(RolesGuard)
  @Roles('location_admin', 'organization_admin')
  getAdminData() {
    return { message: 'Access granted to admin' };
  }
}
