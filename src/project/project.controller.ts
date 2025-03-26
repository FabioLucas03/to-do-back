import { Controller, Get, Post, Body, Param, Put, Delete, Logger } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);
  
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(): Promise<Project[]> {
    this.logger.log('Getting all projects');
    const projects = await this.projectService.findAll();
    this.logger.log(`Retrieved ${projects.length} projects`);
    return projects;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    this.logger.log(`Getting project with id: ${id}`);
    const project = await this.projectService.findOne(id);
    this.logger.log(`Retrieved project: ${project.name}`);
    return project;
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    this.logger.log(`Creating project: ${JSON.stringify(createProjectDto)}`);
    const project = await this.projectService.create(createProjectDto);
    this.logger.log(`Created project with ID: ${project.id}`);
    return project;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.log(`Updating project ${id}: ${JSON.stringify(updateProjectDto)}`);
    const project = await this.projectService.update(id, updateProjectDto);
    this.logger.log(`Updated project: ${project.name}`);
    return project;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting project: ${id}`);
    await this.projectService.remove(id);
    this.logger.log(`Project ${id} deleted successfully`);
    return;
  }
}
