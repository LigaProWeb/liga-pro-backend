import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TournamentFormat, TournamentStatus } from '@app/contracts';

@Entity({ schema: 'tournaments_svc', name: 'tournaments' })
export class TournamentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'sport_id', type: 'int' })
  sportId: number;

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  @Column({ type: 'varchar', length: 40 })
  format: TournamentFormat;

  @Column({ type: 'varchar', length: 40, default: 'open' })
  status: TournamentStatus;
}
