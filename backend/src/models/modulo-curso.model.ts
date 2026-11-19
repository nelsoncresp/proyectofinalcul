import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CursoExtracurricular } from './curso-extracurricular.model';

@Entity('modulos_cursos')
export class ModuloCurso {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    curso_id!: number;

    @Column('int')
    orden!: number;

    @Column({ type: 'varchar', length: 180 })
    titulo!: string;

    @Column({ type: 'text', nullable: true })
    descripcion!: string | null;

    @Column({ type: 'text', nullable: true })
    contenido!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    video_url!: string | null;

    @Column({ type: 'int', default: 30 })
    duracion_minutos!: number;

    @Column({ type: 'tinyint', default: 1 })
    activo!: number;

    @ManyToOne(() => CursoExtracurricular, curso => curso.modulos)
    @JoinColumn({ name: 'curso_id' })
    curso!: CursoExtracurricular;
}
