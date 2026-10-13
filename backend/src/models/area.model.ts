import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Asignatura } from './asignatura.model';

@Entity('areas_conocimiento')
export class Area {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion!: string;

    @Column({ type: 'varchar', length: 30, default: 'blue' })
    color!: string;

    @Column({ type: 'varchar', length: 50, default: 'book' })
    icono!: string;

    @OneToMany(() => Asignatura, asignatura => asignatura.area)
    asignaturas!: Asignatura[];
}
