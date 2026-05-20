import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { RegistrationStatus } from '@app/contracts';
import { TeamEntity } from './team.entity';
import { TournamentEntity } from './tournament.entity';

@Entity({ schema: 'tournaments_svc', name: 'tournament_registrations' })
export class TournamentRegistrationEntity {
  @PrimaryColumn({ name: 'tournament_id', type: 'uuid' })
  tournamentId: string;

  @PrimaryColumn({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    enumName: 'request_status',
    default: 'pending',
  })
  requestStatus: RegistrationStatus;

  @Column({ name: 'registered_at', type: 'timestamptz', nullable: true })
  registeredAt?: Date | null;

  @ManyToOne(() => TournamentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: TournamentEntity;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;
}
