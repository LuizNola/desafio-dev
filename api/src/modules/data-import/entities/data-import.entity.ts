import { Column, Entity } from 'typeorm';
import { StatusType } from '../types/import-status.enum';
import { BaseEntity } from 'src/shared/base.entity';

@Entity({ name: 'dataimport' })
export class DataImport extends BaseEntity {
  @Column({
    type: 'enum',
    enum: StatusType,
    default: StatusType.LOAD,
  })
  status: StatusType;

  @Column({ nullable: true })
  message: string;
}
