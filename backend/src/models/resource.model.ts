import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Asignatura } from './asignatura.model';
import { User } from './user.model';

@Entity('recursos_contenido')
export class RecursoContenido {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    asignatura_id!: number;

    @Column({ type: 'varchar', length: 200 })
    titulo!: string;

    @Column({ type: 'varchar', length: 50 })
    tipo_recurso!: string;

    @Column('text')
    enlace!: string;

    @Column({ type: 'varchar', length: 50, default: 'pendiente' })
    estado_revision!: string;

    @Column({ type: 'int', nullable: true })
    creado_por_id!: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por?: User | null;

    @ManyToOne(() => Asignatura, asignatura => asignatura.recursos)
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
