import { AppDataSource } from './src/config/database';
import { RecursoContenido } from './src/models/resource.model';

async function seed() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(RecursoContenido);
    
    // Validar si ya existe
    let recurso = await repo.findOneBy({ id: 1 });
    if (!recurso) {
        recurso = repo.create({
            id: 1,
            asignatura_id: 1,
            titulo: 'Física Mecánica PDF',
            tipo_recurso: 'documento',
            enlace: 'https://example.com/fisica.pdf',
            estado_revision: 'aprobado'
        });
        await repo.save(recurso);
        console.log('¡Recurso de prueba insertado con éxito! (ID = 1)');
    } else {
        console.log('El recurso ya existía.');
    }
    process.exit(0);
}

seed().catch(err => {
    console.error('Error insertando recurso:', err);
    process.exit(1);
});
