import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ModuloCurso } from './modulo-curso.model';

@Entity('cursos_extracurriculares')
export class CursoExtracurricular {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    codigo!: string;

    @Column({ type: 'varchar', length: 80 })
    interes!: string;

    @Column({ type: 'varchar', length: 180 })
    titulo!: string;

    @Column({ type: 'varchar', length: 255 })
    subtitulo!: string;

    @Column({ type: 'enum', enum: ['Principiante', 'Intermedio', 'Avanzado'] })
    nivel!: 'Principiante' | 'Intermedio' | 'Avanzado';

    @Column({ type: 'varchar', length: 100 })
    duracion!: string;

    @Column({ type: 'varchar', length: 20 })
    color!: string;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'simple-json', nullable: true })
    tags!: string[] | null;

    @Column({ type: 'tinyint', default: 1 })
    activo!: number;

    @OneToMany(() => ModuloCurso, modulo => modulo.curso)
    modulos!: ModuloCurso[];
}
