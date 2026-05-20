import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { SkillLevel } from '@app/contracts';
import { UserEntity } from './user.entity';

@Entity({ schema: 'users_svc', name: 'user_sport_preferences' })
export class UserSportPrefEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'sport_id', type: 'int' })
  sportId: number;

  @Column({ name: 'skill_level', type: 'varchar', length: 40 })
  skillLevel: SkillLevel;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
