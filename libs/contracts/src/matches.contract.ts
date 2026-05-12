export const MATCHES_SERVICE = 'MATCHES_SERVICE';

export const MATCHES_PATTERNS = {
  CREATE: 'matches.create',
  FIND_ALL: 'matches.find_all',
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
}

export interface MatchDto extends CreateMatchDto {
  id: string;
  currentPlayers: number;
  status: 'open' | 'cancelled' | 'completed';
}
