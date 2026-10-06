import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { Asignatura } from './asignatura.model';

@Entity('progreso_estudiante')
export class ProgresoEstudiante {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    @Column('int')
    asignatura_id!: number;

    @Column({ type: 'varchar', length: 50 })
    estado!: string;

    @CreateDateColumn()
    fecha_completado!: Date;

    @ManyToOne(() => User, user => user.progresos)
    @JoinColumn({ name: 'usuario_id' })
    user!: User;

    @ManyToOne(() => Asignatura, asignatura => asignatura.progresos)
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
