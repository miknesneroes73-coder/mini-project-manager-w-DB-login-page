import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { CreatePhaseInput, UpdatePhaseInput } from '../../../application/phase/inputTypes/phase.inputs.js';
import { PhasePageType, PhaseType } from '../../../application/phase/objectTypes/phase.types.js';
import { PhaseCreatorService } from '../../../application/phase/services/phase-creator.service.js';
import { PhaseDeleterService } from '../../../application/phase/services/phase-deleter.service.js';
import { PhaseFinderService } from '../../../application/phase/services/phase-finder.service.js';
import { PhaseUpdaterService } from '../../../application/phase/services/phase-updater.service.js';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';
import { tenantIdFromRequest } from '../../tenant-context.js';
import { LimitPipe, SkipPipe } from '../../pagination.pipe.js';
import { PhaseNotFoundError } from '../../../application/phase/errors/phase.errors.js';

interface GqlContext { req: Request; }

@Resolver(() => PhaseType)
export class PhaseResolver {
  constructor(
    private readonly finder: PhaseFinderService,
    private readonly creator: PhaseCreatorService,
    private readonly updater: PhaseUpdaterService,
    private readonly deleter: PhaseDeleterService,
  ) {}

  @Mutation(() => ID)
  async createPhase(@Args('input') input: CreatePhaseInput, @Context() context: GqlContext): Promise<string> {
    return this.creator.run(tenantIdFromRequest(context.req), input);
  }

  @Mutation(() => ID)
  async updatePhase(@Args('input') input: UpdatePhaseInput, @Context() context: GqlContext): Promise<string> {
    return this.updater.run(tenantIdFromRequest(context.req), input);
  }

  @Mutation(() => ID)
  async deletePhase(@Args('id', { type: () => ID }) id: string, @Context() context: GqlContext): Promise<string> {
    return this.deleter.run(tenantIdFromRequest(context.req), id);
  }

  @Query(() => PhaseType)
  async phase(@Args('id', { type: () => ID }) id: string, @Context() context: GqlContext): Promise<PhaseType> {
    const phase = await this.finder.findOne(tenantIdFromRequest(context.req), id);
    if (!phase) throw new PhaseNotFoundError();
    return this.toGraphql(phase);
  }

  @Query(() => PhasePageType)
  async phases(
    @Context() context: GqlContext,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
    @Args('status', { type: () => PhaseStatus, nullable: true }) status?: PhaseStatus,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }, LimitPipe) limit = 10,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }, SkipPipe) skip = 0,
  ): Promise<PhasePageType> {
    const page = await this.finder.run(tenantIdFromRequest(context.req), { projectId, status, limit, skip });
    return { data: page.data.map((phase) => this.toGraphql(phase)), count: page.count };
  }

  private toGraphql(phase: { id: string; tenantId: string; projectId: string; title: string; order: number; status: PhaseStatus; createdAt: Date; updatedAt: Date }): PhaseType {
    return {
      ...phase,
      createdAt: phase.createdAt.toISOString(),
      updatedAt: phase.updatedAt.toISOString(),
    };
  }
}
