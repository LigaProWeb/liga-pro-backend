import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { MatchStatus } from '@app/contracts';

@Entity({ schema: 'matches_svc', name: 'matches' })
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'sport_id', type: 'int' })
  sportId: number;

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ name: 'match_date', type: 'timestamptz' })
  matchDate: Date;

  @Column({ name: 'max_players', type: 'int', default: 2 })
  maxPlayers: number;

  @Column({
    type: 'enum',
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    enumName: 'match_status',
    default: 'open',
  })
  status: MatchStatus;

  @Column({ name: 'global_score_a', type: 'int', nullable: true })
  globalScoreA?: number | null;

  @Column({ name: 'global_score_b', type: 'int', nullable: true })
  globalScoreB?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
