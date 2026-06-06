import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService, JobView } from '../../infra/jobs/jobs.service';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('jobs')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get(':jobId')
  @ApiOperation({ summary: 'Get a background-job status' })
  @ApiParam({ name: 'jobId' })
  @ApiOkResponse({ description: 'Job status and progress.' })
  @ApiNotFoundResponse()
  async getStatus(
    @CurrentUser() user: AuthUser,
    @Param('jobId') jobId: string,
  ): Promise<JobView> {
    const view = await this.jobs.getStatus(jobId);
    const orgId = user.organization_id;
    if (user.role !== 'super_admin' && orgId && view.id) {
      const job = await this.jobs['db'].job.findUnique({
        where: { id: view.id },
        select: { organization_id: true },
      });
      if (!job || (orgId && job.organization_id !== orgId)) {
        throw new ForbiddenException({
          error: {
            code: 'FORBIDDEN',
            message: 'Job does not belong to your organization.',
          },
        });
      }
    }
    return view;
  }
}
