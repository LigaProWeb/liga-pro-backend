export const USERS_SERVICE = 'USERS_SERVICE';

export const USERS_PATTERNS = {
  REGISTER: 'users.register',
  LOGIN: 'users.login',
  FIND_BY_ID: 'users.find_by_id',
  UPDATE_PROFILE: 'users.update_profile',
  UPSERT_SPORT_PREFERENCE: 'users.upsert_sport_preference',
  FIND_SPORT_PREFERENCES: 'users.find_sport_preferences',
} as const;

export const USERS_EVENTS = {
  REGISTERED: 'user.registered',
  PROFILE_UPDATED: 'user.profile_updated',
  SPORT_PREFERENCE_UPDATED: 'user.sport_preference_updated',
} as const;

export type UserRole = 'user' | 'super_admin';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  globalRole: UserRole;
  isPublic?: boolean;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  isPublic: boolean;
  rating?: number;
}

export interface UserSportPreferenceDto {
  userId: string;
  sportId: number;
  skillLevel: SkillLevel;
}

export interface UserDto {
  id: string;
  email: string;
  globalRole: UserRole;
  profile?: UserProfileDto;
  sportPreferences?: UserSportPreferenceDto[];
}

export interface AuthResponseDto {
  access_token: string;
  user: UserDto;
}

export interface UpdateProfileDto {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  isPublic?: boolean;
}

export interface UpsertSportPreferenceDto {
  userId: string;
  sportId: number;
  skillLevel: SkillLevel;
}
