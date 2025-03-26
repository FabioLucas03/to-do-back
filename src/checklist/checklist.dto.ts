import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class CreateChecklistItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  taskId?: string;
}

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
