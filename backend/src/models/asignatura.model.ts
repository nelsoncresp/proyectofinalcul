import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { RecursoContenido } from './resource.model';
import { ProgresoEstudiante } from './progress.model';

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
}
