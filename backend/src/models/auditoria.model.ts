import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('auditoria_pensum')
export class AuditoriaPensum {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    @Column({ type: 'varchar', length: 100 })
    accion!: string;

    @Column('text')
    detalle!: string;

    @CreateDateColumn()
    fecha!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    user!: User;
}
