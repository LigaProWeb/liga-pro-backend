import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MATCHES_PATTERNS } from '@app/contracts';
import type { CreateMatchDto, MatchDto, UpdateMatchDto, UpdateResultDto } from '@app/contracts';
import { MatchesServiceService } from './matches-service.service';

@Controller()
export class MatchesServiceController {
  constructor(private readonly matchesServiceService: MatchesServiceService) {}

  @MessagePattern(MATCHES_PATTERNS.CREATE)
  createMatch(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.create(createMatchDto);
  }

  @MessagePattern(MATCHES_PATTERNS.FIND_ALL)
  findAll(): MatchDto[] {
    return this.matchesServiceService.findAll();
  }

  @MessagePattern(MATCHES_PATTERNS.UPDATE)
  updateMatch(updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    return this.matchesServiceService.update(updateMatchDto);
  }

  @MessagePattern(MATCHES_PATTERNS.DELETE)
  deleteMatch(id: string): Promise<void> {
    return this.matchesServiceService.delete(id);
  }

  @MessagePattern(MATCHES_PATTERNS.UPDATE_RESULT)
  updateResult(updateResultDto: UpdateResultDto): Promise<MatchDto> {
    return this.matchesServiceService.updateResult(updateResultDto);
  }

  //ENDPOINTS
}
