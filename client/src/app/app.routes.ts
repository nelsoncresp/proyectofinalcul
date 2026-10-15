import { Routes } from '@angular/router';
import { LandingController } from './controllers/landing.controller';
import { LoginController } from './controllers/login.controller';
import { RegisterController } from './controllers/register.controller';
import { DashboardEstudianteController } from './controllers/dashboard-estudiante.controller';
import { AulaEstudianteController } from './controllers/aula-estudiante.controller';
import { DashboardAdminController } from './controllers/dashboard-admin.controller';
import { NodeEditorController } from './controllers/node-editor.controller';
import { AuthGuard } from './services/auth.guard';
import { AccessDeniedController } from './controllers/access-denied.controller';

export const routes: Routes = [
	{ path: '', component: LandingController },
	{ path: 'login', component: LoginController },
	{ path: 'register', component: RegisterController },
	{
		path: 'dashboard-estudiante',
		component: DashboardEstudianteController,
		canActivate: [AuthGuard],
		data: { roles: ['Estudiante'] }
	},
	{
		path: 'aula/:id',
		component: AulaEstudianteController,
		canActivate: [AuthGuard],
		data: { roles: ['Estudiante'] }
	},
	{
		path: 'dashboard-admin',
		component: DashboardAdminController,
		canActivate: [AuthGuard],
		data: { roles: ['Administrador'] }
	},
	{ path: 'node-editor', component: NodeEditorController, canActivate: [AuthGuard], data: { roles: ['Administrador'] } },
	{ path: 'access-denied', component: AccessDeniedController },
	{ path: '**', redirectTo: '' }
];
