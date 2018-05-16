import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { CursoComponent } from './componentes/curso.component'
import { RecursoComponent } from './componentes/recurso.component'
import { UsuarioComponent } from './componentes/usuario.component'
import { PantallaAppComponent } from './componentes/pantalla-app.component'
import { LoginComponent } from './componentes/login.component'
import { ReservaProfesorComponent } from './componentes/reserva-profesor.component';
import { MensajeComponent } from './componentes/mensaje.component';

const appRoutes: Routes = [
	{
		path: 'pantallaApp', component: PantallaAppComponent, children: [
			{ path: '', component: UsuarioComponent },
			{ path: 'profesores', component: UsuarioComponent },
			{ path: 'reservas', component: ReservaProfesorComponent },
			{ path: 'cursos', component: CursoComponent },
			{ path: 'mensajes', component: MensajeComponent },
			{ path: 'recursos/:tipo', component: RecursoComponent },
			{ path: '**', component: UsuarioComponent }
		]
	},
	{ path: 'login', component: LoginComponent },
	{ path: '', component: LoginComponent }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);