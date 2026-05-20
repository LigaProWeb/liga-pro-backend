import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ schema: 'users_svc', name: 'user_profiles' })
export class UserProfileEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 120 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 120 })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ name: 'is_profile_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 5,
  })
  rating: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
