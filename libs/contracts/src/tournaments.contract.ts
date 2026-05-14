import type { MatchDto, SportType } from './matches.contract';
export const TOURNAMENTS_SERVICE = 'TOURNAMENTS_SERVICE';

export const TOURNAMENTS_PATTERNS = {
    CREATE: 'tournaments.create',
    FIND_ALL: 'tournaments.find_all',
} as const;

export const TOURNAMENTS_EVENTS = {
    CREATED: 'tournament.created',
} as const;

export interface CreateTournamentDto {
    name: string;
    description: string;
    sport: SportType;
    startDate: string;
    endDate: string;
    location: string;
    maxTeams: number;
    organizerId: string;
}

export interface TeamDto {
    id: string;
    name: string;
    members: string[];
    matches: MatchDto[];
}

export interface TournamentDto extends CreateTournamentDto {
    id: string;
    currentTeams: number;
    teams: TeamDto[];
    status: 'open' | 'closed' | 'cancelled' | 'completed';
}
