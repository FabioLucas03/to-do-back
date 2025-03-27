import { Controller, Get, Logger, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { 
  TasksByStatusDto, 
  TasksByPriorityDto, 
  TasksByProjectDto, 
  TimeSpentByProjectDto, 
  ChecklistProgressDto,
  TasksCompletionOverTimeDto
} from './analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tasks-by-status')
  async getTasksByStatus(): Promise<TasksByStatusDto[]> {
    this.logger.log('Fetching tasks by status analytics');
    return this.analyticsService.getTasksByStatus();
  }

  @Get('tasks-by-priority')
  async getTasksByPriority(): Promise<TasksByPriorityDto[]> {
    this.logger.log('Fetching tasks by priority analytics');
    return this.analyticsService.getTasksByPriority();
  }

  @Get('tasks-by-project')
  async getTasksByProject(): Promise<TasksByProjectDto[]> {
    this.logger.log('Fetching tasks by project analytics');
    return this.analyticsService.getTasksByProject();
  }

  @Get('time-by-project')
  async getTimeByProject(): Promise<TimeSpentByProjectDto[]> {
    this.logger.log('Fetching time spent by project analytics');
    return this.analyticsService.getTimeSpentByProject();
  }

  @Get('checklist-progress')
  async getChecklistProgress(): Promise<ChecklistProgressDto[]> {
    this.logger.log('Fetching checklist progress analytics');
    return this.analyticsService.getChecklistProgress();
  }

  @Get('completion-over-time')
  async getCompletionOverTime(
    @Query('timeRange') timeRange: 'week' | 'month' | 'all' = 'week'
  ): Promise<TasksCompletionOverTimeDto[]> {
    this.logger.log(`Fetching task completion over time analytics (${timeRange})`);
    return this.analyticsService.getTasksCompletionOverTime(timeRange);
  }

  @Get('summary')
  async getSummary() {
    this.logger.log('Fetching analytics summary');
    return this.analyticsService.getSummary();
  }
}
