import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MATCHES_PATTERNS } from '@app/contracts';
import type {
  CreateMatchDto,
  JoinMatchDto,
  LeaveMatchDto,
  MatchDto,
  UpdateMatchDto,
  UpdateResultDto,
} from '@app/contracts';
import { MatchesServiceService } from './matches-service.service';

//CONTROLLER: recibe mensajes, delega a servicio y devuelve respuesta
@Controller()
export class MatchesServiceController {
  constructor(private readonly matchesServiceService: MatchesServiceService) {}

  //ENDPOINTS
  //endpoints de microservicio, reciben mensajes y delegan a servicio

  //crear partido
  @MessagePattern(MATCHES_PATTERNS.CREATE)
  createMatch(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.create(createMatchDto);
  }

  //obtener todos los partidos
  @MessagePattern(MATCHES_PATTERNS.FIND_ALL)
  findAll(): Promise<MatchDto[]> {
    return this.matchesServiceService.findAll();
  }

  //obtener partido por ID
  @MessagePattern(MATCHES_PATTERNS.FIND_BY_ID)
  findById(id: string): Promise<MatchDto | undefined> {
    return this.matchesServiceService.findById(id);
  }

  //actualizar partido
  @MessagePattern(MATCHES_PATTERNS.UPDATE)
  updateMatch(updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.update(updateMatchDto);
  }

  //cancelar partido
  @MessagePattern(MATCHES_PATTERNS.CANCEL)
  cancelMatch(id: string): Promise<MatchDto> {
    return this.matchesServiceService.cancel(id);
  }

  //unirse a partido
  @MessagePattern(MATCHES_PATTERNS.JOIN)
  joinMatch(joinMatchDto: JoinMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.join(joinMatchDto);
  }

  //salir de partido
  @MessagePattern(MATCHES_PATTERNS.LEAVE)
  leaveMatch(leaveMatchDto: LeaveMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.leave(leaveMatchDto);
  }

  //eliminar partido
  @MessagePattern(MATCHES_PATTERNS.DELETE)
  deleteMatch(id: string): Promise<void> {
    return this.matchesServiceService.delete(id);
  }

  //actualizar resultado
  @MessagePattern(MATCHES_PATTERNS.UPDATE_RESULT)
  updateResult(updateResultDto: UpdateResultDto): Promise<MatchDto> {
    return this.matchesServiceService.updateResult(updateResultDto);
  }
}
