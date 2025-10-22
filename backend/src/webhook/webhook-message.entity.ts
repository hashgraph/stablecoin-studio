import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('webhook_messages')
export class WebhookMessage {
  @PrimaryGeneratedColumn('uuid')
  dbId: string;

  @Column({ type: 'varchar', length: 500 })
  id: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 100 })
  sender: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'boolean', default: true })
  sent: boolean;

  @Column({ type: 'varchar', length: 50, default: 'AUTRE' })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  amount: string;

  @CreateDateColumn()
  receivedAt: Date;
}
