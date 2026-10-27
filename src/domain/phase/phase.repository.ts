export const PHASE_REPOSITORY = Symbol('PHASE_REPOSITORY');

import { PhaseStatus } from './phase.enums.js';

export interface PhaseRecord {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  order: number;
  status: PhaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseCreateData {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  order: number;
  status: PhaseStatus;
}

export interface PhaseUpdateData {
  id: string;
  tenantId: string;
  title?: string;
  order?: number;
  status?: PhaseStatus;
  projectId?: string;
}

export interface PhaseListFilters {
  tenantId: string;
  projectId?: string;
  status?: PhaseStatus;
  limit: number;
  skip: number;
}

export interface PhaseRepository {
  create(data: PhaseCreateData): Promise<string>;
  update(data: PhaseUpdateData): Promise<string>;
  findVisibleById(tenantId: string, id: string): Promise<PhaseRecord | null>;
  findMany(filters: PhaseListFilters): Promise<{ data: PhaseRecord[]; count: number }>;
  findAllByProject(tenantId: string, projectId: string): Promise<PhaseRecord[]>;
  archive(tenantId: string, id: string): Promise<void>;
}
