import { Controller, Get, Post, Body, Param, Put, Delete, Query, BadRequestException, Logger, Patch } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { ChecklistService } from '../checklist/checklist.service';
import { CommentService } from '../comment/comment.service';

@Controller('tasks')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(
    private readonly taskService: TaskService,
    private readonly checklistService: ChecklistService,
    private readonly commentService: CommentService,
  ) {}

  @Get()
  async findAll(@Query('projectId') projectId?: string): Promise<Task[]> {
    this.logger.log(`Fetching tasks${projectId ? ` for project: ${projectId}` : ' (all)'}`);
    let tasks: Task[];
    
    if (projectId) {
      tasks = await this.taskService.findByProjectId(projectId);
    } else {
      tasks = await this.taskService.findAll();
    }
    
    this.logger.log(`Returned ${tasks.length} tasks`);
    return tasks;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Task> {
    this.logger.log(`Fetching task with ID: ${id}`);
    return this.taskService.findOne(id);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      this.logger.log(`Creating task: ${JSON.stringify(createTaskDto, null, 2)}`);
      
      // Extract checklist and comments to handle separately
      const { checklist, comments, deadlineTime, project, ...taskData } = createTaskDto;
      
      // Handle deadline validation more flexibly
      if (taskData.deadline) {
        try {
          // Ensure deadline is a valid date
          const dateValue = new Date(taskData.deadline);
          if (isNaN(dateValue.getTime())) {
            throw new Error('Invalid date');
          }
          
          // Use the validated date object
          taskData.deadline = dateValue;
          this.logger.log(`Validated deadline: ${dateValue.toISOString()}`);
        } catch (error) {
          this.logger.error(`Invalid deadline format: ${taskData.deadline}`);
          throw new BadRequestException('Invalid deadline format. Please provide a valid date');
        }
      }
      
      // Set the projectId explicitly from either projectId or project field
      const projectId = createTaskDto.projectId || createTaskDto.project;
      this.logger.log(`Using projectId: ${projectId}`);
      
      // Create the task with basic data
      const task = await this.taskService.create({
        ...taskData,
        projectId,
      });
      this.logger.log(`Created task with ID: ${task.id}`);
      
      // Add checklist items if provided
      if (checklist && checklist.length > 0) {
        this.logger.log(`Adding ${checklist.length} checklist items`);
        for (const item of checklist) {
          // Strip out any ids provided from frontend since we'll generate new ones
          const { id, ...itemData } = item;
          const checklistItem = await this.checklistService.create({
            ...itemData,
            taskId: task.id,
          });
          this.logger.log(`Added checklist item: ${checklistItem.id}`);
        }
      }
      
      // Add comments if provided
      if (comments && comments.length > 0) {
        this.logger.log(`Adding ${comments.length} comments`);
        for (const comment of comments) {
          const newComment = await this.commentService.create({
            text: comment.text,
            taskId: task.id,
          });
          this.logger.log(`Added comment: ${newComment.id}`);
        }
      }
      
      // Return the task with all relations
      const fullTask = await this.taskService.findOne(task.id);
      this.logger.log(`Returning complete task: ${JSON.stringify(fullTask, null, 2)}`);
      return fullTask;
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create task: ${error.message}`);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      this.logger.log(`Atualizando tarefa ${id}: ${JSON.stringify(updateTaskDto, null, 2)}`);
      
      // Handle deadline validation for updates
      if (updateTaskDto.deadline) {
        try {
          // Ensure deadline is a valid date
          const dateValue = new Date(updateTaskDto.deadline);
          if (isNaN(dateValue.getTime())) {
            throw new Error('Data inválida');
          }
          
          // Use the validated date object
          updateTaskDto.deadline = dateValue;
          this.logger.log(`Validada data prazo para atualização: ${dateValue.toISOString()}`);
        } catch (error) {
          this.logger.error(`Formato de data inválido para atualização: ${updateTaskDto.deadline}`);
          throw new BadRequestException('Formato de data inválido. Por favor, forneça uma data válida');
        }
      }
      
      // Verificar se já temos a tarefa antes da atualização
      const existingTask = await this.taskService.findOne(id);
      this.logger.log(`Tarefa existente encontrada: ${JSON.stringify({
        id: existingTask.id,
        project: existingTask.project?.id,
        projectId: existingTask.projectId
      }, null, 2)}`);
      
      // CRITICAL: Always set projectId properly
      // Se project é fornecido, configura projectId para a atualização
      if (updateTaskDto.project) {
        // Use type guard to check if project is string or object
        if (typeof updateTaskDto.project === 'string') {
          updateTaskDto['projectId'] = updateTaskDto.project;
          this.logger.log(`Configurando projectId (string) para ${updateTaskDto['projectId']}`);
        } else if (typeof updateTaskDto.project === 'object' && updateTaskDto.project !== null) {
          // Safely access the id property after confirming it's an object
          const projectId = (updateTaskDto.project as { id: string }).id;
          if (projectId) {
            updateTaskDto['projectId'] = projectId;
            this.logger.log(`Configurando projectId (objeto) para ${updateTaskDto['projectId']}`);
          }
        }
        
        // Remove project property to avoid conflicts with projectId
        delete updateTaskDto.project;
        this.logger.log('Removido campo project para evitar conflitos com projectId');
      }
      
      // Se o projectId não foi fornecido na atualização, manter o existente
      if (!updateTaskDto['projectId'] && existingTask) {
        updateTaskDto['projectId'] = existingTask.projectId;
        this.logger.log(`Mantendo projectId existente: ${updateTaskDto['projectId']}`);
      }
      
      this.logger.log(`DTO final para atualização: ${JSON.stringify(updateTaskDto, null, 2)}`);
      
      // First update the base task without relations
      const updatedTask = await this.taskService.update(id, updateTaskDto);
      
      // If checklist items are provided, process them
      if (updateTaskDto.checklist && updateTaskDto.checklist.length > 0) {
        this.logger.log(`Processing ${updateTaskDto.checklist.length} checklist items for update`);
        
        // First, get existing checklist items for comparison
        const existingChecklist = await this.checklistService.findByTaskId(id);
        
        // Create a map of existing item IDs for quick lookup
        const existingItemMap = new Map();
        existingChecklist.forEach(item => {
          existingItemMap.set(item.id, item);
        });
        
        // Process each checklist item in the DTO
        for (const item of updateTaskDto.checklist) {
          if (item.id && existingItemMap.has(item.id)) {
            // Update existing item
            await this.checklistService.update(item.id, {
              text: item.text,
              completed: item.completed
            });
            this.logger.log(`Updated checklist item: ${item.id}`);
            // Remove from map to track what's been processed
            existingItemMap.delete(item.id);
          } else {
            // Create new item
            const newItem = await this.checklistService.create({
              text: item.text,
              completed: item.completed || false,
              taskId: id
            });
            this.logger.log(`Added new checklist item: ${newItem.id}`);
          }
        }
        
        // Any items left in the map weren't included in the update, so we can delete them
        for (const [itemId] of existingItemMap) {
          await this.checklistService.remove(itemId);
          this.logger.log(`Deleted checklist item: ${itemId}`);
        }
      }
      
      // Get the fully updated task with relations
      const fullTask = await this.taskService.findOne(id);
      this.logger.log(`Tarefa atualizada com sucesso: ${JSON.stringify(fullTask, null, 2)}`);
      return fullTask;
    } catch (error) {
      this.logger.error(`Erro ao atualizar tarefa: ${error.message}`, error.stack);
      throw new BadRequestException(`Falha ao atualizar tarefa: ${error.message}`);
    }
  }

  // Adicionar um endpoint específico para atualizações de tempo
  @Patch(':id/time')
  async updateTime(
    @Param('id') id: string,
    @Body('timeSpent') timeSpent: number,
  ): Promise<void> {
    this.logger.log(`Atualizando apenas o tempo da tarefa ${id} para ${timeSpent}`);
    
    try {
      // Usar uma função simplificada no serviço
      await this.taskService.updateTime(id, timeSpent);
      this.logger.log(`Tempo da tarefa ${id} atualizado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar o tempo da tarefa ${id}:`, error.stack);
      throw new BadRequestException(`Falha ao atualizar tempo: ${error.message}`);
    }
  }

  // Adicionar um endpoint específico para atualizações de tempo e estado do timer
  @Patch(':id/timer')
  async updateTimer(
    @Param('id') id: string,
    @Body() timerData: { timeSpent: number, timerActive: boolean },
  ): Promise<void> {
    this.logger.log(`Atualizando timer da tarefa ${id}: tempo=${timerData.timeSpent}, ativo=${timerData.timerActive}`);
    
    try {
      // Usar uma função específica no serviço para atualizar o estado do timer
      await this.taskService.updateTimer(id, timerData.timeSpent, timerData.timerActive);
      this.logger.log(`Timer da tarefa ${id} atualizado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar o timer da tarefa ${id}:`, error.stack);
      throw new BadRequestException(`Falha ao atualizar timer: ${error.message}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting task: ${id}`);
    await this.taskService.remove(id);
    this.logger.log(`Task ${id} deleted successfully`);
    return;
  }
}
