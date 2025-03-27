export class TasksByStatusDto {
  id: number;
  value: number;
  label: string;
  color: string;
}

export class TasksByPriorityDto {
  id: number;
  value: number;
  label: string;
  color: string;
}

export class TasksByProjectDto {
  id: number;
  value: number;
  label: string;
  color: string;
}

export class TimeSpentByProjectDto {
  project: string;
  hours: number;
}

export class ChecklistProgressDto {
  id: number;
  value: number;
  label: string;
  color: string;
}

export class TasksCompletionOverTimeDto {
  date: string;
  count: number;
}
