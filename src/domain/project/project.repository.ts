export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

import { ProjectPriority, ProjectStatus } from './project.enums.js';

export interface ProjectRecord {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreateData {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
}

export interface ProjectUpdateData {
  id: string;
  tenantId: string;
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
}

export interface ProjectListFilters {
  tenantId: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
  limit: number;
  skip: number;
}

export interface ProjectRepository {
  create(data: ProjectCreateData): Promise<string>;
  update(data: ProjectUpdateData): Promise<string>;
  findVisibleById(tenantId: string, id: string): Promise<ProjectRecord | null>;
  findMany(filters: ProjectListFilters): Promise<{ data: ProjectRecord[]; count: number }>;
}
