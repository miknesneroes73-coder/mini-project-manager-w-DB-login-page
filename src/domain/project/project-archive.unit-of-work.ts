export const PROJECT_ARCHIVE_UNIT_OF_WORK = Symbol('PROJECT_ARCHIVE_UNIT_OF_WORK');

export interface ProjectArchiveUnitOfWork {
  run(tenantId: string, projectId: string): Promise<void>;
}
