import { BaseEntity } from 'src/shared/base.entity';
import { Column, Entity } from 'typeorm';
import { TransactionType } from '../type/transactions-type.enum';

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEBIT,
  })
  type: TransactionType;

  @Column()
  value: number;

  @Column()
  cpf: string;

  @Column()
  card: string;

  @Column()
  timeOfOccurrence: Date;

  @Column()
  shopOwner: string;

  @Column()
  shopName: string;
}
