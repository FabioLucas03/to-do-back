import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { ChecklistItem } from '../checklist/checklist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project, ChecklistItem]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
