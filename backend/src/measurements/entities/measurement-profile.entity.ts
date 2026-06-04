import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('measurement_profiles')
export class MeasurementProfile {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
    userId!: string;

  @Column({ type: 'varchar', length: 100 })
    name!: string;

  @Column({ type: 'varchar', length: 30 })
    garment!: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    height!: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
    gender!: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
    weight!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    shoulder!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    bust!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    waist!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    hip!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    neck!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    sleeve!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'arm_length' })
    armLength!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    bicep!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
    wrist!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'kameez_length' })
    kameezLength!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
    confidence!: number;

  @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}