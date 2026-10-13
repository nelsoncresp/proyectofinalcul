import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Asignatura } from './asignatura.model';

/**
 * Reto de código práctico por asignatura. Se ejecuta y verifica en el
 * navegador (Web Worker) contra los casos de prueba almacenados.
 */
@Entity('retos')
export class Reto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    asignatura_id!: number;

    @Column('text')
    enunciado!: string;

    /** Código inicial que se carga en el editor del estudiante. */
    @Column('text')
    plantilla!: string;

    /** Nombre de la función que el estudiante debe implementar. */
    @Column({ type: 'varchar', length: 100 })
    nombre_funcion!: string;

    /** Casos de prueba: cada uno invoca la función con `entrada` (array de argumentos) y compara contra `esperado`. */
    @Column('simple-json')
    casos!: { entrada: unknown[]; esperado: unknown }[];

    @OneToOne(() => Asignatura)
    @JoinColumn({ name: 'asignatura_id' })
    asignatura!: Asignatura;
}
