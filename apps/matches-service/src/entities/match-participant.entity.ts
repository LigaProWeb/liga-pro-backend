import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type MatchParticipantStatus = 'pending' | 'approved' | 'rejected';

@Entity({ schema: 'matches_svc', name: 'match_participants' })
export class MatchParticipantEntity {
  @PrimaryColumn({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    enumName: 'request_status',
    default: 'pending',
  })
  status: MatchParticipantStatus;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
