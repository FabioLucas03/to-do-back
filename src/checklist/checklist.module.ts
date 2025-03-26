import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistItem } from './checklist.entity';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistItem])],
  controllers: [ChecklistController],
  providers: [ChecklistService],
  exports: [ChecklistService],
})
export class ChecklistModule {}
