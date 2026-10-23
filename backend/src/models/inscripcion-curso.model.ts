import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

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

    /** ID del curso en el catálogo del front (ej. 'web-101'). */
    @Column({ type: 'varchar', length: 50 })
    curso_id!: string;

    @Column({ type: 'varchar', length: 80 })
    interes!: string;

    /** Índices de módulos del temario marcados como vistos. */
    @Column({ type: 'simple-json', nullable: true })
    modulos_vistos!: number[] | null;

    @CreateDateColumn()
    fecha!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;
}
