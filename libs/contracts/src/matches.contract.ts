export const MATCHES_SERVICE = 'MATCHES_SERVICE';

//UTILIDADES

export const MATCHES_PATTERNS = {
  CREATE: 'matches.create',
  FIND_ALL: 'matches.find_all',
  //AGREGAR ESTA FUNCIONES
  //UPDATE, cambiar de fecha o de lugar, agregar o eliminar jugadores, cancelar partido, completar partido, etc
  //DELETE
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

export interface MatchDto extends CreateMatchDto {
  id: string;
  currentPlayers: number;
  status: 'open' | 'cancelled' | 'completed';
}
