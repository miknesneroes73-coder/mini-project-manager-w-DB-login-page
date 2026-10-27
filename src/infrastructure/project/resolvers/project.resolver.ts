import { Args, Context, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { ProjectFinderService } from '../../../application/project/services/project-finder.service.js';
import { ProjectCreatorService } from '../../../application/project/services/project-creator.service.js';
import { ProjectUpdaterService } from '../../../application/project/services/project-updater.service.js';
import { ProjectDeleterService } from '../../../application/project/services/project-deleter.service.js';
import { ProjectPageType, ProjectType, PhaseSummaryType } from '../../../application/project/objectTypes/project.types.js';
import { ProjectNotFoundError } from '../../../application/project/errors/project.errors.js';
import { CreateProjectInput, UpdateProjectInput } from '../../../application/project/inputTypes/project.inputs.js';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';
import { PhaseFinderService } from '../../../application/phase/services/phase-finder.service.js';
import { tenantIdFromRequest } from '../../tenant-context.js';
import { LimitPipe, SkipPipe } from '../../pagination.pipe.js';

interface GqlContext {
  req: Request;
}

@Resolver(() => ProjectType)
export class ProjectResolver {
  constructor(
    private readonly finder: ProjectFinderService,
    private readonly creator: ProjectCreatorService,
    private readonly updater: ProjectUpdaterService,
    private readonly deleter: ProjectDeleterService,
    private readonly phaseFinder: PhaseFinderService,
  ) {}

  @Mutation(() => ID)
  async createProject(@Args('input') input: CreateProjectInput, @Context() context: GqlContext): Promise<string> {
    return this.creator.run(tenantIdFromRequest(context.req), input);
  }

  @Mutation(() => ID)
  async updateProject(@Args('input') input: UpdateProjectInput, @Context() context: GqlContext): Promise<string> {
    return this.updater.run(tenantIdFromRequest(context.req), input);
  }

  @Mutation(() => ID)
  async deleteProject(@Args('id', { type: () => ID }) id: string, @Context() context: GqlContext): Promise<string> {
    return this.deleter.run(tenantIdFromRequest(context.req), id);
  }

  @Query(() => ProjectType)
  async project(@Args('id', { type: () => ID }) id: string, @Context() context: GqlContext): Promise<ProjectType> {
    const tenantId = tenantIdFromRequest(context.req);
    const project = await this.finder.findOne(tenantId, id);
    if (!project) {
      throw new ProjectNotFoundError();
    }
    return this.toGraphql(project);
  }

  @Query(() => ProjectPageType)
  async projects(
    @Context() context: GqlContext,
    @Args('status', { type: () => ProjectStatus, nullable: true }) status?: ProjectStatus,
    @Args('priority', { type: () => ProjectPriority, nullable: true }) priority?: ProjectPriority,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }, LimitPipe) limit = 10,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }, SkipPipe) skip = 0,
  ): Promise<ProjectPageType> {
    const tenantId = tenantIdFromRequest(context.req);
    const page = await this.finder.run(tenantId, { status, priority, search, limit, skip });
    return { data: page.data.map((project) => this.toGraphql(project)), count: page.count };
  }

  @ResolveField(() => [PhaseSummaryType])
  async phases(@Parent() project: ProjectType, @Context() context: GqlContext): Promise<PhaseSummaryType[]> {
    const tenantId = tenantIdFromRequest(context.req);
    const phases = await this.phaseFinder.findAllByProject(tenantId, project.id);
    return phases.map((phase) => ({
      id: phase.id,
      tenantId: phase.tenantId,
      projectId: phase.projectId,
      title: phase.title,
      order: phase.order,
      status: phase.status,
      createdAt: phase.createdAt.toISOString(),
      updatedAt: phase.updatedAt.toISOString(),
    }));
  }

  private toGraphql(project: { id: string; tenantId: string; title: string; description: string | null; status: ProjectStatus; priority: ProjectPriority; createdAt: Date; updatedAt: Date }): ProjectType {
    return {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      phases: [],
    };
  }
}
