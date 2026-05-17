import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MATCHES_EVENTS, NOTIFICATIONS_SERVICE } from '@app/contracts';
import type {
  CreateMatchDto,
  JoinMatchDto,
  LeaveMatchDto,
  MatchDto,
  UpdateMatchDto,
  UpdateResultDto,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';

//SERVICIO: lógica de negocio, gestión de datos y comunicación con otros servicios
@Injectable()
export class MatchesServiceService {
  private readonly matches: MatchDto[] = [];

  //INYECCIÓN DE DEPENDENCIAS: cliente para enviar notificaciones a otros servicios
  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientProxy,
  ) {}

  //VALIDACIONES: lógica para validar datos de entrada
  private validateCreateDto(createMatchDto: CreateMatchDto): void {
    if (!createMatchDto.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!createMatchDto.location?.trim()) {
      throw new Error('Location is required');
    }
    if (!createMatchDto.organizerId?.trim()) {
      throw new Error('OrganizerId is required');
    }
    if (createMatchDto.maxPlayers <= 0) {
      throw new Error('maxPlayers must be greater than zero');
    }
    if (Number.isNaN(Date.parse(createMatchDto.matchDate))) {
      throw new Error('matchDate must be a valid date');
    }
  }

  //LÓGICA DE NEGOCIO: métodos para gestionar partidos, unirse, salir, actualizar resultados, etc.
  async create(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    this.validateCreateDto(createMatchDto);

    const match: MatchDto = {
      id: `match-${Date.now()}`,
      currentPlayers: 1,
      status: 'open',
      globalScoreA: undefined,
      globalScoreB: undefined,
      participantIds: [createMatchDto.organizerId],
      createdAt: new Date().toISOString(),
      ...createMatchDto,
    };

    this.matches.push(match);

    await firstValueFrom(
      this.notificationsClient.emit(MATCHES_EVENTS.CREATED, match),
    );

    return match;
  }

  //método para obtener todos los partidos
  findAll(): MatchDto[] {
    return this.matches;
  }

  //método para obtener partido por ID
  findById(id: string): MatchDto | undefined {
    return this.matches.find((m) => m.id === id);
  }

  //método para actualizar partido, con validaciones para estado y número de jugadores
  async update(updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    const matchIndex = this.matches.findIndex(
      (m) => m.id === updateMatchDto.id,
    );
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }

    const match = this.matches[matchIndex];
    if (match.status === 'completed' || match.status === 'cancelled') {
      throw new Error('Cannot update a completed or cancelled match');
    }

    if (updateMatchDto.title !== undefined) {
      match.title = updateMatchDto.title;
    }
    if (updateMatchDto.location !== undefined) {
      match.location = updateMatchDto.location;
    }
    if (updateMatchDto.matchDate !== undefined) {
      match.matchDate = updateMatchDto.matchDate;
    }
    if (updateMatchDto.maxPlayers !== undefined) {
      if (updateMatchDto.maxPlayers < match.currentPlayers) {
        throw new Error('maxPlayers cannot be lower than current participants');
      }
      match.maxPlayers = updateMatchDto.maxPlayers;
    }

    return match;
  }

  //método para eliminar partido, con validación de existencia
  async delete(id: string): Promise<void> {
    const matchIndex = this.matches.findIndex((m) => m.id === id);
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }

    this.matches.splice(matchIndex, 1);
  }

  //método para cancelar partido, con validación de estado
  async cancel(id: string): Promise<MatchDto> {
    const match = this.findById(id);
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.status === 'completed') {
      throw new Error('Cannot cancel a completed match');
    }
    match.status = 'cancelled';
    return match;
  }

  //método para unirse a partido, con validaciones de estado, capacidad y participación previa
  async join(joinMatchDto: JoinMatchDto): Promise<MatchDto> {
    const match = this.findById(joinMatchDto.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.status !== 'open') {
      throw new Error('Cannot join a match that is not open');
    }
    if (match.participantIds.includes(joinMatchDto.userId)) {
      throw new Error('User is already a participant');
    }
    if (match.currentPlayers >= match.maxPlayers) {
      throw new Error('Match is full');
    }

    match.participantIds.push(joinMatchDto.userId);
    match.currentPlayers = match.participantIds.length;

    return match;
  }

  //método para salir de partido, con validaciones de participación previa
  async leave(leaveMatchDto: LeaveMatchDto): Promise<MatchDto> {
    const match = this.findById(leaveMatchDto.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    const participantIndex = match.participantIds.indexOf(leaveMatchDto.userId);
    if (participantIndex === -1) {
      throw new Error('User is not a participant');
    }

    match.participantIds.splice(participantIndex, 1);
    match.currentPlayers = match.participantIds.length;

    return match;
  }

  //método para actualizar resultado de un partido, con validación de existencia
  async updateResult(updateResultDto: UpdateResultDto): Promise<MatchDto> {
    const match = this.findById(updateResultDto.id);
    if (!match) {
      throw new Error('Match not found');
    }

    match.globalScoreA = updateResultDto.globalScoreA;
    match.globalScoreB = updateResultDto.globalScoreB;
    match.status = 'completed';

    return match;
  }
}

