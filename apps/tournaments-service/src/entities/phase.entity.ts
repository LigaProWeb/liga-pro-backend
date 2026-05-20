import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'tournaments_svc', name: 'phases' })
export class PhaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  name: string;
}
