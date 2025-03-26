import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  text?: string;
}
