import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { CursoComponent } from './componentes/curso.component'
import { RecursoComponent } from './componentes/recurso.component'
import { UsuarioComponent } from './componentes/usuario.component'
import { PantallaAppComponent } from './componentes/pantalla-app.component'
import { LoginComponent } from './componentes/login.component'
import { ReservaProfesorComponent } from './componentes/reserva-profesor.component';
import { HorarioComponent } from './componentes/horario.component';
import { GeneradorCalendarioComponent } from './componentes/generador-calendario.component';
import { HistoricoProfesoresComponent } from './componentes/historico-profesores.component';
import { HomeComponent } from './componentes/home.component';

const appRoutes: Routes = [
	{
		path: 'pantallaApp', component: PantallaAppComponent, children: [
			{ path: '', component: HomeComponent },
			{ path: 'inicio', component: HomeComponent },
			{ path: 'profesores', component: UsuarioComponent },
			{ path: 'historico-profesores', component: HistoricoProfesoresComponent },
			{ path: 'reservas', component: ReservaProfesorComponent },
			{ path: 'cursos', component: CursoComponent },
			{ path: 'horarios', component: HorarioComponent },
			{ path: 'generador-calendario', component: GeneradorCalendarioComponent },
			{ path: 'recursos/:tipo', component: RecursoComponent },
			{ path: '**', component: HomeComponent }
		]
	},
	{ path: 'login', component: LoginComponent },
	{ path: '', component: LoginComponent }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);