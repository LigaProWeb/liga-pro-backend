export const TOURNAMENTS_SERVICE = 'TOURNAMENTS_SERVICE';

export const TOURNAMENTS_PATTERNS = {
  CREATE: 'tournaments.create',
  FIND_ALL: 'tournaments.find_all',
  FIND_BY_ID: 'tournaments.find_by_id',
  REGISTER_TEAM: 'tournaments.register_team',
  GENERATE_FIXTURE: 'tournaments.generate_fixture',
  REPORT_FIXTURE_RESULT: 'tournaments.report_fixture_result',
} as const;

export const TOURNAMENTS_EVENTS = {
  CREATED: 'tournament.created',
  TEAM_REGISTERED: 'tournament.team_registered',
  FIXTURE_GENERATED: 'tournament.fixture_generated',
  FIXTURE_COMPLETED: 'tournament.fixture_completed',
  TEAM_ADVANCED: 'tournament.team_advanced',
  TEAM_ELIMINATED: 'tournament.team_eliminated',
  COMPLETED: 'tournament.completed',
} as const;

export type TournamentFormat =
  | 'league'
  | 'knockout'
  | 'group_stage_and_knockout';
export type TournamentStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type FixtureStatus = 'pending' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface CreateTournamentDto {
  name: string;
  startDate: string;
  endDate: string;
  sportId: number;
  organizerId: string;
  format: TournamentFormat;
}

export interface TeamMemberDto {
  teamId: string;
  userId: string;
  requestStatus: RegistrationStatus;
}

export interface TeamDto {
  id: string;
  name: string;
  captainId: string;
  members: TeamMemberDto[];
}

export interface RegisterTeamDto {
  tournamentId: string;
  team: {
    name: string;
    captainId: string;
    memberIds: string[];
  };
}

export interface TournamentRegistrationDto {
  tournamentId: string;
  teamId: string;
  requestStatus: RegistrationStatus;
}

export interface PhaseDto {
  id: number;
  name: string;
}

export interface FixtureDto {
  id: string;
  tournamentId: string;
  phaseId: number;
  teamAId: string;
  teamBId: string;
  nextFixtureId?: string;
  globalScoreA: number;
  globalScoreB: number;
  winnerTeamId?: string;
  status: FixtureStatus;
}

export interface ReportFixtureResultDto {
  tournamentId: string;
  fixtureId: string;
  globalScoreA: number;
  globalScoreB: number;
}

export interface GenerateFixtureDto {
  tournamentId: string;
}

export interface TournamentDto extends CreateTournamentDto {
  id: string;
  currentTeams: number;
  teams: TeamDto[];
  registrations: TournamentRegistrationDto[];
  phases: PhaseDto[];
  fixtures: FixtureDto[];
  status: TournamentStatus;
}

export interface TournamentTeamResultEvent {
  tournamentId: string;
  tournamentName: string;
  fixtureId: string;
  teamId: string;
  teamName: string;
  captainId: string;
}
