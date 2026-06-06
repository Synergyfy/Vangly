import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { newId } from '../../common/utils/hash';

export type JobKind = 'members_bulk_import';

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface JobView {
  id: string;
  status: JobStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;
  kind: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

type Handler = (
  jobId: string,
  payload: Record<string, unknown>,
  db: DatabaseService,
) => Promise<{
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}>;

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly handlers: Map<JobKind, Handler> = new Map();

  constructor(private readonly db: DatabaseService) {}

  registerHandler(kind: JobKind, handler: Handler): void {
    this.handlers.set(kind, handler);
  }

  async enqueue(
    kind: JobKind,
    organizationId: string,
    locationId: string | null,
    payload: Record<string, unknown>,
  ): Promise<{ jobId: string }> {
    const id = newId('job');
    await this.db.job.create({
      data: {
        id,
        organization_id: organizationId,
        location_id: locationId,
        kind,
        status: 'queued',
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        payload: payload as Prisma.InputJsonValue,
        createdAt: new Date(),
      },
    });
    setImmediate(() => {
      void this.run(id).catch((err) => {
        this.logger.error(`Job ${id} crashed`, err);
      });
    });
    return { jobId: id };
  }

  async getStatus(jobId: string): Promise<JobView> {
    const job = await this.db.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found.`);
    }
    return {
      id: job.id,
      status: job.status as JobStatus,
      total: job.total,
      processed: job.processed,
      succeeded: job.succeeded,
      failed: job.failed,
      errors:
        (job.errors as Array<{ row: number; message: string }> | null) ??
        undefined,
      kind: job.kind,
      started_at: job.started_at?.toISOString(),
      finished_at: job.finished_at?.toISOString(),
      created_at: job.createdAt.toISOString(),
    };
  }

  private async run(jobId: string): Promise<void> {
    const job = await this.db.job.findUnique({ where: { id: jobId } });
    if (!job) return;
    const handler = this.handlers.get(job.kind as JobKind);
    if (!handler) {
      await this.db.job.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          finished_at: new Date(),
          errors: [
            {
              row: 0,
              message: `no handler registered for job kind ${job.kind}`,
            },
          ],
        },
      });
      return;
    }
    await this.db.job.update({
      where: { id: jobId },
      data: { status: 'running', started_at: new Date() },
    });
    try {
      const result = await handler(
        jobId,
        (job.payload as Record<string, unknown>) ?? {},
        this.db,
      );
      await this.db.job.update({
        where: { id: jobId },
        data: {
          status: 'done',
          total: result.total,
          processed: result.succeeded + result.failed,
          succeeded: result.succeeded,
          failed: result.failed,
          errors:
            result.errors.length > 0
              ? (result.errors as unknown as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          finished_at: new Date(),
        },
      });
    } catch (err) {
      this.logger.error(`Job ${jobId} failed`, err);
      await this.db.job.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          finished_at: new Date(),
          errors: [
            {
              row: 0,
              message: err instanceof Error ? err.message : String(err),
            },
          ],
        },
      });
    }
  }
}
