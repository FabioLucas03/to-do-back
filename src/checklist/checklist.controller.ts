import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistItem } from './checklist.entity';
import { CreateChecklistItemDto, UpdateChecklistItemDto } from './checklist.dto';

@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get('task/:taskId')
  findByTaskId(@Param('taskId') taskId: string): Promise<ChecklistItem[]> {
    return this.checklistService.findByTaskId(taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ChecklistItem> {
    return this.checklistService.findOne(id);
  }

  @Post()
  create(@Body() createChecklistItemDto: CreateChecklistItemDto): Promise<ChecklistItem> {
    return this.checklistService.create(createChecklistItemDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateChecklistItemDto: UpdateChecklistItemDto,
  ): Promise<ChecklistItem> {
    return this.checklistService.update(id, updateChecklistItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.checklistService.remove(id);
  }
}
