import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ChecklistModule } from '../checklist/checklist.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ChecklistModule,
    CommentModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
