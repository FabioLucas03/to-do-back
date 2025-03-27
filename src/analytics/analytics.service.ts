import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { ChecklistItem } from '../checklist/checklist.entity';
import { 
  TasksByStatusDto, 
  TasksByPriorityDto, 
  TasksByProjectDto, 
  TimeSpentByProjectDto, 
  ChecklistProgressDto,
  TasksCompletionOverTimeDto
} from './analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ChecklistItem)
    private checklistRepository: Repository<ChecklistItem>,
  ) {}

  async getTasksByStatus(): Promise<TasksByStatusDto[]> {
    this.logger.log('Calculating tasks by status');
    
    // Count completed and pending tasks
    const completedCount = await this.taskRepository.count({ where: { completed: true } });
    const totalCount = await this.taskRepository.count();
    const pendingCount = totalCount - completedCount;

    return [
      { id: 0, value: completedCount, label: 'Concluídas', color: '#23d160' },
      { id: 1, value: pendingCount, label: 'Pendentes', color: '#ff3860' }
    ];
  }

  async getTasksByPriority(): Promise<TasksByPriorityDto[]> {
    this.logger.log('Calculating tasks by priority');
    
    // Count tasks by priority
    const highCount = await this.taskRepository.count({ where: { priority: 'high' } });
    const mediumCount = await this.taskRepository.count({ where: { priority: 'medium' } });
    const lowCount = await this.taskRepository.count({ where: { priority: 'low' } });

    return [
      { id: 0, value: highCount, label: 'Alta', color: '#ff3860' },
      { id: 1, value: mediumCount, label: 'Média', color: '#ffdd57' },
      { id: 2, value: lowCount, label: 'Baixa', color: '#3298dc' },
    ];
  }

  async getTasksByProject(): Promise<TasksByProjectDto[]> {
    this.logger.log('Calculating tasks by project');
    
    // Define colors for consistency
    const colors = ['#6a329f', '#3298dc', '#ff3860', '#ffdd57', '#23d160', '#ff9e3b', '#b86bff', '#54c8ff'];
    
    // Get all projects with task counts
    const projects = await this.projectRepository.find();
    
    // For each project, count its tasks
    const result: TasksByProjectDto[] = [];
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const count = await this.taskRepository.count({ where: { projectId: project.id } });
      
      if (count > 0) {
        result.push({
          id: i,
          value: count,
          label: project.name,
          color: colors[i % colors.length]
        });
      }
    }
    
    return result;
  }

  async getTimeSpentByProject(): Promise<TimeSpentByProjectDto[]> {
    this.logger.log('Calculating time spent by project');
    
    // Get all projects
    const projects = await this.projectRepository.find();
    
    // For each project, sum the time spent on its tasks
    const result: TimeSpentByProjectDto[] = [];
    for (const project of projects) {
      // Get all tasks for this project
      const tasks = await this.taskRepository.find({ where: { projectId: project.id } });
      
      // Sum the time spent
      const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      
      // Only include projects with some time spent
      if (totalTimeSpent > 0) {
        // Convert seconds to hours with 2 decimal places
        const hoursSpent = Math.round((totalTimeSpent / 3600) * 100) / 100;
        
        result.push({
          project: project.name,
          hours: hoursSpent
        });
      }
    }
    
    return result;
  }

  async getChecklistProgress(): Promise<ChecklistProgressDto[]> {
    this.logger.log('Calculating checklist progress');
    
    // Get all checklist items
    const checklistItems = await this.checklistRepository.find();
    const totalItems = checklistItems.length;
    const completedItems = checklistItems.filter(item => item.completed).length;
    
    return [
      { id: 0, value: completedItems, label: 'Concluídos', color: '#23d160' },
      { id: 1, value: totalItems - completedItems, label: 'Pendentes', color: '#ff3860' }
    ];
  }

  async getTasksCompletionOverTime(timeRange: 'week' | 'month' | 'all'): Promise<TasksCompletionOverTimeDto[]> {
    this.logger.log(`Calculating task completion over time (${timeRange})`);
    
    // Get all completed tasks
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.completed = :completed', { completed: true });
    
    // Apply time filter
    const now = new Date();
    if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      query.andWhere('task.updatedAt >= :startDate', { startDate: oneWeekAgo });
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      query.andWhere('task.updatedAt >= :startDate', { startDate: oneMonthAgo });
    }
    
    // Execute the query
    const completedTasks = await query.getMany();
    
    // Group by date
    const completionByDate: Record<string, number> = {};
    
    completedTasks.forEach(task => {
      // Use updatedAt as completion date (more accurate than deadline)
      const completionDate = task.updatedAt;
      const dateStr = completionDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      completionByDate[dateStr] = (completionByDate[dateStr] || 0) + 1;
    });
    
    // Sort dates and format for chart
    const sortedDates = Object.keys(completionByDate).sort();
    
    return sortedDates.map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return {
        date: new Date(year, month - 1, day).toISOString(),
        count: completionByDate[dateStr]
      };
    });
  }

  async getSummary() {
    this.logger.log('Gathering analytics summary');
    
    const totalTasks = await this.taskRepository.count();
    const completedTasks = await this.taskRepository.count({ where: { completed: true } });
    const pendingTasks = totalTasks - completedTasks;
    const totalProjects = await this.projectRepository.count();
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalProjects
    };
  }
}
