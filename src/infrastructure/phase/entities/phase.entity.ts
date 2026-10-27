import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';

@Entity({ name: 'phases' })
export class PhaseEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'integer' })
  order!: number;

  @Column({ type: 'enum', enum: PhaseStatus, default: PhaseStatus.PENDING })
  status!: PhaseStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
