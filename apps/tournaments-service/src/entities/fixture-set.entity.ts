import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FixtureEntity } from './fixture.entity';

@Entity({ schema: 'tournaments_svc', name: 'fixture_sets' })
export class FixtureSetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fixture_id', type: 'uuid' })
  fixtureId: string;

  @Column({ name: 'set_number', type: 'int' })
  setNumber: number;

  @Column({ name: 'score_a', type: 'int' })
  scoreA: number;

  @Column({ name: 'score_b', type: 'int' })
  scoreB: number;

  @ManyToOne(() => FixtureEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fixture_id' })
  fixture: FixtureEntity;
}
