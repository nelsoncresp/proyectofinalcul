import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Asignatura } from './asignatura.model';

@Entity('lecciones_evaluaciones')
export class LeccionEvaluacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    asignatura_id!: number;

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

    @OneToOne(() => Asignatura, asignatura => asignatura.leccion)
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
