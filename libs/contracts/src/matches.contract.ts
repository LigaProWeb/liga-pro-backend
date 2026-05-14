export const MATCHES_SERVICE = 'MATCHES_SERVICE';

//UTILIDADES

export const MATCHES_PATTERNS = {
  CREATE: 'matches.create',
  FIND_ALL: 'matches.find_all',
  UPDATE: 'matches.update',
  DELETE: 'matches.delete',
  UPDATE_RESULT: 'matches.update_result',
} as const;

export const MATCHES_EVENTS = {
  CREATED: 'match.created',
} as const;

export type SportType = 'football' | 'padel' | 'volley';

export interface CreateMatchDto {
  sport: SportType;
  title: string;
  location: string;
  date: string;
  maxPlayers: number;
  organizerId: string;
  //RESULTADO DE PARTIDO VER COMO CAMBIAR Y ACTUALIZAR EL VALOR DE EL RESULTADO CUANDO TERMINE
}

export interface UpdateMatchDto {
  id: string;
  title?: string;
  location?: string;
  date?: string;
  maxPlayers?: number;
}

export interface UpdateResultDto {
  id: string;
  teamAScore: number;
  teamBScore: number;
}

export interface MatchDto extends CreateMatchDto {
  id: string;
  currentPlayers: number;
  status: 'open' | 'cancelled' | 'completed';
  result?: { teamA: number; teamB: number };
}
