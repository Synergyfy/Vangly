import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserEntity {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() role!: string;
  @Expose() organization_id!: string | null;
  @Expose() branch_id!: string | null;
  @Expose() credits!: number;

  static fromUser(user: Record<string, any>): UserEntity {
    return Object.assign(new UserEntity(), user) as UserEntity;
  }
}
