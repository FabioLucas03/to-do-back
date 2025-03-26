import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['project', 'checklist', 'comments'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { projectId },
      relations: ['project', 'checklist', 'comments'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'checklist', 'comments'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async create(createTaskDto: any): Promise<Task> {
    try {
      this.logger.log(`Creating task with data: ${JSON.stringify(createTaskDto, null, 2)}`);
      
      // Ensure projectId is set correctly
      const taskData = {
        ...createTaskDto,
        projectId: createTaskDto.projectId || createTaskDto.project,
      };
      
      this.logger.log(`Processed task data: ${JSON.stringify(taskData, null, 2)}`);
      
      // Create a new Task instance from the data
      const newTask = this.taskRepository.create(taskData);
      this.logger.log(`Task entity created (not yet saved)`);
      
      // Save task and handle potential array response
      const savedResult = await this.taskRepository.save(newTask);
      this.logger.log(`Task saved to database: ${JSON.stringify(savedResult, null, 2)}`);
      
      if (Array.isArray(savedResult)) {
        this.logger.warn('Received array when saving single task, using first item');
        return savedResult[0];
      }
      
      // Return the saved task
      return savedResult;
    } catch (error) {
      this.logger.error(`Error in task service create: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      // First fetch the task to validate it exists
      const task = await this.findOne(id);
      this.logger.log(`Found existing task for update: ${JSON.stringify(task, null, 2)}`);
      
      // Log the DTO we're applying
      this.logger.log(`Applying update DTO: ${JSON.stringify(updateTaskDto, null, 2)}`);
      
      // Create a clean update object without undefined values
      const cleanUpdateData = Object.entries(updateTaskDto)
        .filter(([_, value]) => value !== undefined)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      
      this.logger.log(`Clean update data: ${JSON.stringify(cleanUpdateData, null, 2)}`);
      
      // Update the task with the clean data
      Object.assign(task, cleanUpdateData);
      
      // Save and return the updated task
      const savedTask = await this.taskRepository.save(task);
      this.logger.log(`Task saved successfully: ${JSON.stringify(savedTask, null, 2)}`);
      
      // Return the updated task with all relations
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Error updating task ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Adicionar um método específico para atualizações de tempo
  async updateTime(id: string, timeSpent: number): Promise<void> {
    try {
      this.logger.log(`Atualizando apenas o tempo da tarefa ${id}: ${timeSpent}`);
      
      // Buscar o valor atual para comparação
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      
      // Só atualizar se o novo tempo for maior que o atual
      if (timeSpent > task.timeSpent) {
        // Utilizar queryBuilder para atualização eficiente
        await this.taskRepository
          .createQueryBuilder()
          .update(Task)
          .set({ timeSpent, updatedAt: new Date() })
          .where("id = :id", { id })
          .execute();
          
        this.logger.log(`Tempo da tarefa ${id} atualizado com sucesso para ${timeSpent}s`);
      } else {
        this.logger.log(`Ignorando atualização: tempo atual (${task.timeSpent}s) >= novo tempo (${timeSpent}s)`);
      }
    } catch (error) {
      this.logger.error(`Erro ao atualizar tempo da tarefa ${id}:`, error.stack);
      throw error;
    }
  }

  // Método específico para atualizações de tempo e estado do timer
  async updateTimer(id: string, timeSpent: number, timerActive: boolean): Promise<void> {
    try {
      this.logger.log(`Atualizando timer da tarefa ${id}: tempo=${timeSpent}, ativo=${timerActive}`);
      
      // Buscar o valor atual para comparação
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      
      // Atualizar o tempo e o estado do timer
      await this.taskRepository
        .createQueryBuilder()
        .update(Task)
        .set({ 
          timeSpent, 
          timerActive,
          updatedAt: new Date() 
        })
        .where("id = :id", { id })
        .execute();
        
      this.logger.log(`Timer da tarefa ${id} atualizado com sucesso para ${timeSpent}s, ativo=${timerActive}`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar timer da tarefa ${id}:`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
