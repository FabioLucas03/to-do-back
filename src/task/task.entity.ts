import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { Comment } from '../comment/comment.entity';
import { ChecklistItem } from '../checklist/checklist.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  priority: 'low' | 'medium' | 'high';

  @Column({ default: 0 })
  timeSpent: number;

  @Column({ default: false })
  timerActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  projectId: string;

  @OneToMany(() => Comment, comment => comment.task, { eager: true, cascade: true })
  comments: Comment[];

  @OneToMany(() => ChecklistItem, checklistItem => checklistItem.task, { eager: true, cascade: true })
  checklist: ChecklistItem[];
}
