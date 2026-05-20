import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { UserRole } from '@app/contracts';

@Entity({ schema: 'users_svc', name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'global_role', type: 'varchar', length: 40 })
  globalRole: UserRole;
}
