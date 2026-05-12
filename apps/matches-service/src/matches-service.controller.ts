import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MATCHES_PATTERNS } from '@app/contracts';
import type { CreateMatchDto, MatchDto } from '@app/contracts';
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
}
