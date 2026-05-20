import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { FixtureStatus } from '@app/contracts';
import { PhaseEntity } from './phase.entity';
import { TeamEntity } from './team.entity';
import { TournamentEntity } from './tournament.entity';

@Entity({ schema: 'tournaments_svc', name: 'fixtures' })
export class FixtureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tournament_id', type: 'uuid' })
  tournamentId: string;

  @Column({ name: 'phase_id', type: 'int' })
  phaseId: number;

  @Column({ name: 'group_name', type: 'varchar', length: 80, nullable: true })
  groupName?: string | null;

  @Column({ name: 'team_a_id', type: 'uuid' })
  teamAId: string;

  @Column({ name: 'team_b_id', type: 'uuid' })
  teamBId: string;

  @Column({ name: 'match_time', type: 'timestamptz', nullable: true })
  matchTime?: Date | null;

  @Column({ name: 'next_fixture_id', type: 'uuid', nullable: true })
  nextFixtureId?: string | null;

  @Column({ name: 'global_score_a', type: 'int', default: 0 })
  globalScoreA: number;

  @Column({ name: 'global_score_b', type: 'int', default: 0 })
  globalScoreB: number;

  winnerTeamId?: string | null;
  @Column({ type: 'varchar', length: 40, default: 'pending' })
  status: FixtureStatus;

  @ManyToOne(() => TournamentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: TournamentEntity;

  @ManyToOne(() => PhaseEntity)
  @JoinColumn({ name: 'phase_id' })
  phase: PhaseEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_a_id' })
  teamA: TeamEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_b_id' })
  teamB: TeamEntity;
}
