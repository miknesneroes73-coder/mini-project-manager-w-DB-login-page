import { describe, expect, it, jest } from '@jest/globals';
import { ProjectCreatorService } from './project-creator.service.js';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';

describe('ProjectCreatorService', () => {
  it('generates an id, uses the tenant and returns the repository id', async () => {
    const repository: jest.Mocked<ProjectRepository> = {
      create: jest.fn<ProjectRepository['create']>().mockResolvedValue('generated-id'),
      update: jest.fn<ProjectRepository['update']>(),
      findVisibleById: jest.fn<ProjectRepository['findVisibleById']>(),
      findMany: jest.fn<ProjectRepository['findMany']>(),
    };
    const service = new ProjectCreatorService(repository);

    const result = await service.run('11111111-1111-4111-8111-111111111111', {
      title: 'Web',
      description: undefined,
      status: undefined,
      priority: ProjectPriority.HIGH,
    });

    expect(result).toBe('generated-id');
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: '11111111-1111-4111-8111-111111111111',
      title: 'Web',
      status: ProjectStatus.PLANNED,
      priority: ProjectPriority.HIGH,
    }));
    expect(repository.create.mock.calls[0][0].id).toEqual(expect.any(String));
  });
});
