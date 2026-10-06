import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role.model';
import { ProgresoEstudiante } from './progress.model';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column('int')
    rol_id!: number;

    @Column({ type: 'tinyint', unsigned: true, nullable: true })
    semestre!: number | null;

    @Column({ type: 'enum', enum: ['Diurno', 'Nocturno'], nullable: true })
    jornada!: 'Diurno' | 'Nocturno' | null;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'rol_id' })
    role!: Role;

    @OneToMany(() => ProgresoEstudiante, progreso => progreso.user)
    progresos!: ProgresoEstudiante[];
}
