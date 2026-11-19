import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Asignatura } from './asignatura.model';
import { User } from './user.model';

@Entity('lecciones_evaluaciones')
@Unique(['asignatura_id', 'corte'])
export class LeccionEvaluacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    asignatura_id!: number;

    @Column({ type: 'tinyint', default: 1 })
    corte!: number;

    @Column('text')
    contenido_lectura!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    video_url!: string | null;

    @Column({ type: 'int', default: 0 })
    tiempo_minimo_segundos!: number;

    @Column({ type: 'varchar', length: 255 })
    pregunta!: string;

    @Column('simple-json')
    opciones!: string[];

    @Column('int')
    respuesta_correcta!: number;

    @Column('text')
    explicacion!: string;

    @Column({
        type: 'enum',
        enum: ['borrador', 'publicada'],
        default: 'publicada'
    })
    estado!: 'borrador' | 'publicada';

    @Column({ type: 'int', nullable: true })
    creado_por_id!: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por?: User | null;

    @ManyToOne(() => Asignatura, asignatura => asignatura.lecciones)
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
