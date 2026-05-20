import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FixtureEntity } from './fixture.entity';

@Entity({ schema: 'tournaments_svc', name: 'fixture_audits' })
export class FixtureAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fixture_id', type: 'uuid' })
  fixtureId: string;

  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy: string;

  @Column({
    name: 'conflict_type',
    type: 'enum',
    enum: ['score_dispute', 'conduct', 'identity_fraud', 'other'],
    enumName: 'audit_conflict_type',
  })
  conflictType: 'score_dispute' | 'conduct' | 'identity_fraud' | 'other';

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'evidence_url', type: 'varchar', nullable: true })
  evidenceUrl?: string | null;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: true })
  createdAt?: Date | null;

  @ManyToOne(() => FixtureEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fixture_id' })
  fixture: FixtureEntity;
}
