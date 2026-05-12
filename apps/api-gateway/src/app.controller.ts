import { Body, Controller, Get, Post } from '@nestjs/common';
import type { CreateMatchDto, MatchDto } from '@app/contracts';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('matches')
  createMatch(@Body() createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.appService.createMatch(createMatchDto);
  }

  @Get('matches')
  findMatches(): Promise<MatchDto[]> {
    return this.appService.findMatches();
  }
}
