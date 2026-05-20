import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'tournaments_svc', name: 'teams' })
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'captain_id', type: 'uuid' })
  captainId: string;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: true })
  createdAt?: Date | null;
}
