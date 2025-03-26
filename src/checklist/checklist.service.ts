import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItem } from './checklist.entity';
import { CreateChecklistItemDto, UpdateChecklistItemDto } from './checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(ChecklistItem)
    private checklistRepository: Repository<ChecklistItem>,
  ) {}

  async findByTaskId(taskId: string): Promise<ChecklistItem[]> {
    return this.checklistRepository.find({
      where: { taskId },
      order: {
        createdAt: 'ASC' // Garantir que os itens mantenham a ordem de criação
      }
    });
  }

  async findOne(id: string): Promise<ChecklistItem> {
    const item = await this.checklistRepository.findOne({ where: { id } });
    
    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${id} not found`);
    }
    
    return item;
  }

  async create(createChecklistItemDto: CreateChecklistItemDto): Promise<ChecklistItem> {
    const item = this.checklistRepository.create(createChecklistItemDto);
    return this.checklistRepository.save(item);
  }

  async update(id: string, updateChecklistItemDto: UpdateChecklistItemDto): Promise<ChecklistItem> {
    const item = await this.findOne(id);
    this.checklistRepository.merge(item, updateChecklistItemDto);
    return this.checklistRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.checklistRepository.remove(item);
  }
}
