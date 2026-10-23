import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { Asignatura } from './asignatura.model';

@Entity('cortes_aprobados')
export class CorteAprobado {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    @Column('int')
    asignatura_id!: number;

    @Column({ type: 'tinyint' })
    corte!: number;

    @CreateDateColumn({ type: 'datetime' })
    fecha!: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

    @ManyToOne(() => Asignatura, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
