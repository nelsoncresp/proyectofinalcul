import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { RecursoContenido } from './resource.model';
import { ProgresoEstudiante } from './progress.model';
import { Area } from './area.model';
import { LeccionEvaluacion } from './leccion.model';

@Entity('asignaturas')
export class Asignatura {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    nombre!: string;

    @Column('int')
    semestre!: number;

    @Column('int')
    area_id!: number;

    @ManyToOne(() => Area, area => area.asignaturas)
    @JoinColumn({ name: 'area_id' })
    area!: Area;

    @ManyToMany(() => Asignatura)
    @JoinTable({
        name: 'prerrequisitos',
        joinColumn: { name: 'asignatura_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'prerrequisito_id', referencedColumnName: 'id' }
    })
    prerrequisitos!: Asignatura[];

    @OneToMany(() => RecursoContenido, recurso => recurso.asignatura)
    recursos!: RecursoContenido[];

    @OneToMany(() => ProgresoEstudiante, progreso => progreso.asignatura)
    progresos!: ProgresoEstudiante[];

    @OneToOne(() => LeccionEvaluacion, leccion => leccion.asignatura)
    leccion!: LeccionEvaluacion;
}

