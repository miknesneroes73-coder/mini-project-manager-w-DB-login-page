import { describe, expect, it, jest } from '@jest/globals';
import { ProjectDeleterService } from './project-deleter.service.js';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import type { ProjectArchiveUnitOfWork } from '../../../domain/project/project-archive.unit-of-work.js';

describe('ProjectDeleterService', () => {
  it('throws PROJECT_NOT_FOUND and does not archive when the project is absent', async () => {
    const repository: jest.Mocked<ProjectRepository> = {
      create: jest.fn<ProjectRepository['create']>(),
      update: jest.fn<ProjectRepository['update']>(),
      findVisibleById: jest.fn<ProjectRepository['findVisibleById']>().mockResolvedValue(null),
      findMany: jest.fn<ProjectRepository['findMany']>(),
    };
    const unitOfWork: jest.Mocked<ProjectArchiveUnitOfWork> = {
      run: jest.fn<ProjectArchiveUnitOfWork['run']>(),
    };
    const service = new ProjectDeleterService(repository, unitOfWork);

    await expect(service.run('tenant', 'missing')).rejects.toMatchObject({ code: 'PROJECT_NOT_FOUND' });
    expect(unitOfWork.run).not.toHaveBeenCalled();
  });

  it('archives project and phases through the transaction unit of work', async () => {
    const repository: jest.Mocked<ProjectRepository> = {
      create: jest.fn<ProjectRepository['create']>(),
      update: jest.fn<ProjectRepository['update']>(),
      findVisibleById: jest.fn<ProjectRepository['findVisibleById']>().mockResolvedValue({
        id: 'p1',
        tenantId: 'tenant',
        title: 'Project',
        description: null,
        status: ProjectStatus.PLANNED,
        priority: ProjectPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findMany: jest.fn<ProjectRepository['findMany']>(),
    };
    const unitOfWork: jest.Mocked<ProjectArchiveUnitOfWork> = {
      run: jest.fn<ProjectArchiveUnitOfWork['run']>().mockResolvedValue(undefined),
    };
    const service = new ProjectDeleterService(repository, unitOfWork);

    await expect(service.run('tenant', 'p1')).resolves.toBe('p1');
    expect(unitOfWork.run).toHaveBeenCalledWith('tenant', 'p1');
  });
});
