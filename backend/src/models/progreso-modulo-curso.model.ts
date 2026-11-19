import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { InscripcionCurso } from './inscripcion-curso.model';
import { ModuloCurso } from './modulo-curso.model';

@Entity('progreso_modulos_cursos')
@Unique(['inscripcion_id', 'modulo_id'])
export class ProgresoModuloCurso {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    inscripcion_id!: number;

    @Column('int')
    modulo_id!: number;

    @CreateDateColumn()
    fecha_inicio!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_completado!: Date | null;

    @ManyToOne(() => InscripcionCurso)
    @JoinColumn({ name: 'inscripcion_id' })
    inscripcion!: InscripcionCurso;

    @ManyToOne(() => ModuloCurso)
    @JoinColumn({ name: 'modulo_id' })
    modulo!: ModuloCurso;
}
