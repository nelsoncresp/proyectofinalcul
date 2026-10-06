import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { RecursoContenido } from './resource.model';

@Entity('soporte_tickets')
export class SoporteTicket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    @Column('int')
    recurso_id!: number;

    @Column('text')
    descripcion!: string;

    @Column({ type: 'varchar', length: 50, default: 'abierto' })
    estado!: string;

    @CreateDateColumn()
    fecha_creacion!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    user!: User;

    @ManyToOne(() => RecursoContenido)
    @JoinColumn({ name: 'recurso_id' })
    recurso!: RecursoContenido;
}
