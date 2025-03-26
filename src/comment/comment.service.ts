import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.commentRepository.find({ where: { taskId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    
    if (!comment) {
      this.logger.error(`Comment with ID ${id} not found`);
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    this.logger.log(`Creating new comment for task ${createCommentDto.taskId}`);
    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    this.logger.log(`Updating comment ${id}`);
    const comment = await this.findOne(id);
    this.commentRepository.merge(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to delete comment with ID ${id}`);
    
    try {
      // Verificar se o comentário existe
      const comment = await this.findOne(id);
      
      // Usar delete em vez de remove para maior eficiência e menos chances de erro
      await this.commentRepository.delete(id);
      this.logger.log(`Successfully deleted comment with ID ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete comment with ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
