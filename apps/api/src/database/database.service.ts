import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static pool: Pool | null = null;
  private static adapter: PrismaPg | null = null;

  constructor() {
    if (!DatabaseService.pool) {
      DatabaseService.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      DatabaseService.adapter = new PrismaPg(DatabaseService.pool);
    }

    super({
      adapter: DatabaseService.adapter!,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.seedSuperAdmin();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (DatabaseService.pool) {
      await DatabaseService.pool.end().catch(() => {});
      DatabaseService.pool = null;
      DatabaseService.adapter = null;
    }
  }

  private hashPin(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex');
  }

  async seedSuperAdmin() {
    const superAdminPhone = '+2348000000000';
    const exists = await this.user.findUnique({
      where: { phone: superAdminPhone },
    });

    if (!exists) {
      const pinHash = this.hashPin('1234');
      await this.user.create({
        data: {
          id: 'usr_superadmin',
          name: 'Vangly Super Admin',
          phone: superAdminPhone,
          pin_hash: pinHash,
          pin_history: [pinHash],
          role: 'super_admin',
          organization_id: null,
          branch_id: null,
          credits: 999999,
          failed_attempts: 0,
          locked_until: null,
          suspended: false,
          createdAt: new Date(),
        },
      });
      console.log(
        'Seeded Super Admin user in Postgres: phone +2348000000000, pin 1234',
      );
    }
  }
}
