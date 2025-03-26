import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsDateString, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateChecklistItemDto } from '../checklist/checklist.dto';
import { CreateCommentDto } from '../comment/comment.dto';

// Define a type for the project property that can be either string or an object with id
interface ProjectRef {
  id: string;
  [key: string]: any;
}

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return value;
  })
  deadline?: Date;

  @IsOptional()
  @IsString()
  deadlineTime?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsBoolean()
  timerActive?: boolean;

  @IsNotEmpty()
  @IsString()
  project: string;
  
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  checklist?: CreateChecklistItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentDto)
  comments?: CreateCommentDto[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return value;
  })
  deadline?: Date;

  @IsOptional()
  @IsString()
  deadlineTime?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsBoolean()
  timerActive?: boolean;

  @IsOptional()
  project?: string | ProjectRef; // Allow project to be either a string ID or an object with ID

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  checklist?: CreateChecklistItemDto[];
}
