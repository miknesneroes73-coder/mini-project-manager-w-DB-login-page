import { describe, expect, it, jest } from '@jest/globals';
import { ProjectUpdaterService } from './project-updater.service.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';

describe('Project validation', () => {
  it('rejects an update without fields', async () => {
    const repository = {
      create: jest.fn(), update: jest.fn(), findVisibleById: jest.fn(), findMany: jest.fn(),
    } as unknown as jest.Mocked<ProjectRepository>;
    const service = new ProjectUpdaterService(repository);

    await expect(service.run('tenant', { id: 'p1' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(repository.findVisibleById).not.toHaveBeenCalled();
  });

  it('rejects a blank title before writing', async () => {
    const repository = {
      create: jest.fn(), update: jest.fn(), findVisibleById: jest.fn(), findMany: jest.fn(),
    } as unknown as jest.Mocked<ProjectRepository>;
    const service = new ProjectUpdaterService(repository);

    await expect(service.run('tenant', { id: 'p1', title: '   ' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(repository.findVisibleById).not.toHaveBeenCalled();
  });
});
