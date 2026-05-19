import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
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
import { Repository } from 'typeorm';
import { MatchEntity } from './entities/match.entity';
import { MatchParticipantEntity } from './entities/match-participant.entity';

//SERVICIO: lógica de negocio, gestión de datos y comunicación con otros servicios
@Injectable()
export class MatchesServiceService {
  //INYECCIÓN DE DEPENDENCIAS: cliente para enviar notificaciones a otros servicios
  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsClient: ClientProxy,
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,
    @InjectRepository(MatchParticipantEntity)
    private readonly participantsRepository: Repository<MatchParticipantEntity>,
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
    this.validateUuid(createMatchDto.organizerId, 'organizerId');
  }

  //LÓGICA DE NEGOCIO: métodos para gestionar partidos, unirse, salir, actualizar resultados, etc.
  async create(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    this.validateCreateDto(createMatchDto);

    const match = this.matchesRepository.create({
      title: createMatchDto.title,
      sportId: createMatchDto.sportId,
      organizerId: createMatchDto.organizerId,
      location: createMatchDto.location,
      matchDate: new Date(createMatchDto.matchDate),
      maxPlayers: createMatchDto.maxPlayers,
      status: 'open',
    });

    const savedMatch = await this.matchesRepository.save(match);
    await this.participantsRepository.save({
      matchId: savedMatch.id,
      userId: createMatchDto.organizerId,
      status: 'approved',
    });

    const matchDto = await this.toDto(savedMatch);
    await this.emitMatchEvent(MATCHES_EVENTS.CREATED, matchDto);

    return matchDto;
  }

  //método para obtener todos los partidos
  async findAll(): Promise<MatchDto[]> {
    const matches = await this.matchesRepository.find({
      order: { createdAt: 'ASC' },
    });

    return Promise.all(matches.map((match) => this.toDto(match)));
  }

  //método para obtener partido por ID
  async findById(id: string): Promise<MatchDto | undefined> {
    this.validateUuid(id, 'id');

    const match = await this.matchesRepository.findOneBy({ id });
    if (!match) {
      return undefined;
    }

    return this.toDto(match);
  }

  //método para actualizar partido, con validaciones para estado y número de jugadores
  async update(updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    this.validateUuid(updateMatchDto.id, 'id');

    const match = await this.matchesRepository.findOneBy({
      id: updateMatchDto.id,
    });
    if (!match) {
      throw new Error('Match not found');
    }

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
      if (Number.isNaN(Date.parse(updateMatchDto.matchDate))) {
        throw new Error('matchDate must be a valid date');
      }
      match.matchDate = new Date(updateMatchDto.matchDate);
    }
    if (updateMatchDto.maxPlayers !== undefined) {
      const currentPlayers = await this.countParticipants(match.id);
      if (updateMatchDto.maxPlayers < currentPlayers) {
        throw new Error('maxPlayers cannot be lower than current participants');
      }
      match.maxPlayers = updateMatchDto.maxPlayers;
    }

    const savedMatch = await this.matchesRepository.save(match);
    const matchDto = await this.toDto(savedMatch);
    await this.emitMatchEvent(MATCHES_EVENTS.UPDATED, matchDto);

    return matchDto;
  }

  //método para eliminar partido, con validación de existencia
  async delete(id: string): Promise<void> {
    const match = await this.findById(id);
    if (!match) {
      throw new Error('Match not found');
    }

    await this.matchesRepository.delete(id);

    await this.emitMatchEvent(MATCHES_EVENTS.DELETED, match);
  }

  //método para cancelar partido, con validación de estado
  async cancel(id: string): Promise<MatchDto> {
    this.validateUuid(id, 'id');

    const match = await this.matchesRepository.findOneBy({ id });
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.status === 'completed') {
      throw new Error('Cannot cancel a completed match');
    }
    match.status = 'cancelled';

    const savedMatch = await this.matchesRepository.save(match);
    const matchDto = await this.toDto(savedMatch);
    await this.emitMatchEvent(MATCHES_EVENTS.CANCELLED, matchDto);

    return matchDto;
  }

  //método para unirse a partido, con validaciones de estado, capacidad y participación previa
  async join(joinMatchDto: JoinMatchDto): Promise<MatchDto> {
    this.validateUuid(joinMatchDto.matchId, 'matchId');
    this.validateUuid(joinMatchDto.userId, 'userId');

    const match = await this.matchesRepository.findOneBy({
      id: joinMatchDto.matchId,
    });
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.status !== 'open') {
      throw new Error('Cannot join a match that is not open');
    }

    const participant = await this.participantsRepository.findOneBy({
      matchId: joinMatchDto.matchId,
      userId: joinMatchDto.userId,
    });
    if (participant) {
      throw new Error('User is already a participant');
    }

    const currentPlayers = await this.countParticipants(match.id);
    if (currentPlayers >= match.maxPlayers) {
      throw new Error('Match is full');
    }

    await this.participantsRepository.save({
      matchId: joinMatchDto.matchId,
      userId: joinMatchDto.userId,
      status: 'approved',
    });

    const matchDto = await this.toDto(match);
    await this.emitMatchEvent(MATCHES_EVENTS.UPDATED, matchDto);

    return matchDto;
  }

  //método para salir de partido, con validaciones de participación previa
  async leave(leaveMatchDto: LeaveMatchDto): Promise<MatchDto> {
    this.validateUuid(leaveMatchDto.matchId, 'matchId');
    this.validateUuid(leaveMatchDto.userId, 'userId');

    const match = await this.matchesRepository.findOneBy({
      id: leaveMatchDto.matchId,
    });
    if (!match) {
      throw new Error('Match not found');
    }

    const participant = await this.participantsRepository.findOneBy({
      matchId: leaveMatchDto.matchId,
      userId: leaveMatchDto.userId,
    });
    if (!participant) {
      throw new Error('User is not a participant');
    }

    await this.participantsRepository.delete({
      matchId: leaveMatchDto.matchId,
      userId: leaveMatchDto.userId,
    });

    const matchDto = await this.toDto(match);
    await this.emitMatchEvent(MATCHES_EVENTS.UPDATED, matchDto);

    return matchDto;
  }

  //método para actualizar resultado de un partido, con validación de existencia
  async updateResult(updateResultDto: UpdateResultDto): Promise<MatchDto> {
    this.validateUuid(updateResultDto.id, 'id');

    const match = await this.matchesRepository.findOneBy({
      id: updateResultDto.id,
    });
    if (!match) {
      throw new Error('Match not found');
    }

    match.globalScoreA = updateResultDto.globalScoreA;
    match.globalScoreB = updateResultDto.globalScoreB;
    match.status = 'completed';

    const savedMatch = await this.matchesRepository.save(match);
    const matchDto = await this.toDto(savedMatch);
    await this.emitMatchEvent(MATCHES_EVENTS.RESULT_UPDATED, matchDto);

    return matchDto;
  }

  private async emitMatchEvent(
    eventName: string,
    match: MatchDto,
  ): Promise<void> {
    await firstValueFrom(this.notificationsClient.emit(eventName, match));
  }

  private async toDto(match: MatchEntity): Promise<MatchDto> {
    const participantIds = await this.findParticipantIds(match.id);

    return {
      id: match.id,
      title: match.title,
      sportId: match.sportId,
      organizerId: match.organizerId,
      location: match.location,
      matchDate: match.matchDate.toISOString(),
      maxPlayers: match.maxPlayers,
      currentPlayers: participantIds.length,
      status: match.status,
      globalScoreA: match.globalScoreA ?? undefined,
      globalScoreB: match.globalScoreB ?? undefined,
      participantIds,
      createdAt: match.createdAt.toISOString(),
    };
  }

  private async findParticipantIds(matchId: string): Promise<string[]> {
    const participants = await this.participantsRepository.find({
      where: { matchId, status: 'approved' },
      order: { joinedAt: 'ASC' },
    });

    return participants.map((participant) => participant.userId);
  }

  private async countParticipants(matchId: string): Promise<number> {
    return this.participantsRepository.count({
      where: { matchId, status: 'approved' },
    });
  }

  private validateUuid(value: string, fieldName: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      throw new Error(`${fieldName} must be a valid UUID`);
    }
  }
}
