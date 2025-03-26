import { Controller, Get, Post, Body, Param, Put, Delete, Logger } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Controller('comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);
  
  constructor(private readonly commentService: CommentService) {}

  @Get('task/:taskId')
  findByTaskId(@Param('taskId') taskId: string): Promise<Comment[]> {
    this.logger.log(`Finding comments for task ${taskId}`);
    return this.commentService.findByTaskId(taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Comment> {
    this.logger.log(`Finding comment ${id}`);
    return this.commentService.findOne(id);
  }

  @Post()
  create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    this.logger.log(`Creating comment for task ${createCommentDto.taskId}`);
    return this.commentService.create(createCommentDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    this.logger.log(`Updating comment ${id}`);
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Received DELETE request for comment ${id}`);
    try {
      await this.commentService.remove(id);
      this.logger.log(`Successfully deleted comment ${id}`);
      return;
    } catch (error) {
      this.logger.error(`Error deleting comment ${id}: ${error.message}`);
      throw error;
    }
  }
}
