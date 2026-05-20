export const MATCHES_SERVICE = 'MATCHES_SERVICE';

//UTILIDADES

//CONSTANTES
export const MATCHES_PATTERNS = {
  CREATE: 'matches.create',
  FIND_ALL: 'matches.find_all',
  FIND_BY_ID: 'matches.find_by_id',
  UPDATE: 'matches.update',
  DELETE: 'matches.delete',
  CANCEL: 'matches.cancel',
  JOIN: 'matches.join',
  LEAVE: 'matches.leave',
  UPDATE_RESULT: 'matches.update_result',
} as const;

//EVENTOS
export const MATCHES_EVENTS = {
  CREATED: 'match.created',
  UPDATED: 'match.updated',
  DELETED: 'match.deleted',
  CANCELLED: 'match.cancelled',
  RESULT_UPDATED: 'match.result_updated',
} as const;

//TIPOS
export type MatchStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

//DTOs

//DTOs para crear, actualizar y representar partidos
export interface CreateMatchDto {
  title: string;
  sportId: number;
  organizerId: string;
  location: string;
  matchDate: string;
  maxPlayers: number;
}

//DTO para actualizar partido, con campos opcionales
export interface UpdateMatchDto {
  id: string;
  title?: string;
  location?: string;
  matchDate?: string;
  maxPlayers?: number;
}

//DTO para actualizar resultado de un partido
export interface UpdateResultDto {
  id: string;
  globalScoreA: number;
  globalScoreB: number;
}

export interface MatchResultUpdatedEvent extends MatchDto {
  tournamentId?: string;
  fixtureId?: string;
}

//DTOs para unirse y salir de un partido
export interface JoinMatchDto {
  matchId: string;
  userId: string;
}

//DTO para salir de un partido
export interface LeaveMatchDto {
  matchId: string;
  userId: string;
}

//DTO para representar un partido completo
export interface MatchDto extends CreateMatchDto {
  id: string;
  currentPlayers: number;
  status: MatchStatus;
  globalScoreA?: number;
  globalScoreB?: number;
  participantIds: string[];
  createdAt: string;
}
