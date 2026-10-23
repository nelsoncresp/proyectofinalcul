import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { RecursoContenido } from './resource.model';

@Entity('soporte_tickets')
export class SoporteTicket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    /** Nullable: los reportes generales (desde el estudiante) no apuntan a un recurso. */
    @Column('int', { nullable: true })
    recurso_id!: number | null;

    @Column({ type: 'varchar', length: 150 })
    asunto!: string;

    @Column('text')
    descripcion!: string;

    @Column({ type: 'varchar', length: 50, default: 'abierto' })
    estado!: string;

    @CreateDateColumn()
    fecha_creacion!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

    @ManyToOne(() => RecursoContenido)
    @JoinColumn({ name: 'recurso_id' })
    recurso!: RecursoContenido;
}
