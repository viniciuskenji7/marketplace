import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { CreateWorkshopSessionDto } from './dto/create-workshop-session.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { UpdateWorkshopSessionDto } from './dto/update-workshop-session.dto.js';
import { WorkshopService } from './workshop.service.js';

@Controller('oficinas')
export class WorkshopController {
  constructor(private readonly workshops: WorkshopService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.workshops.findAll(page, limit);
  }

  @Post()
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshops.create(dto);
  }

  @Put('sessoes/:sessionId')
  updateSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateWorkshopSessionDto,
  ) {
    return this.workshops.updateSession(sessionId, dto);
  }

  @Delete('sessoes/:sessionId')
  deleteSession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.workshops.deleteSession(sessionId);
  }

  @Get(':id/sessoes')
  findSessions(@Param('id', ParseIntPipe) id: number) {
    return this.workshops.findSessions(id);
  }

  @Post(':id/sessoes')
  createSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateWorkshopSessionDto,
  ) {
    return this.workshops.createSession(id, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkshopDto,
  ) {
    return this.workshops.update(id, dto);
  }
}
