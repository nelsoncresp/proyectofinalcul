import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { CursoExtracurricular } from './curso-extracurricular.model';

/**
 * Inscripción de un estudiante en un curso extracurricular del catálogo por
 * interés (pestaña "Para ti"). `modulos_vistos` guarda los índices de módulos
 * del temario marcados como vistos (JSON array sobre TEXT).
 */
@Entity('inscripciones_cursos')
export class InscripcionCurso {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    usuario_id!: number;

    @Column('int')
    curso_id!: number;

    @ManyToOne(() => CursoExtracurricular)
    @JoinColumn({ name: 'curso_id' })
    curso!: CursoExtracurricular;

    @Column({ type: 'varchar', length: 80 })
    interes!: string;

    /** Índices de módulos del temario marcados como vistos. */
    @Column({ type: 'simple-json', nullable: true })
    modulos_vistos!: number[] | null;

    @Column({
        type: 'enum',
        enum: ['inscrito', 'en_progreso', 'completado'],
        default: 'inscrito'
    })
    estado!: 'inscrito' | 'en_progreso' | 'completado';

    @CreateDateColumn()
    fecha!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;
}
