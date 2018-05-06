import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { CursoComponent } from './componentes/curso.component'
import { RecursoComponent } from './componentes/recurso.component'
import { UsuarioComponent } from './componentes/usuario.component'

const appRoutes: Routes = [
	{ path: '', component: UsuarioComponent },
	{ path: 'profesores', component: UsuarioComponent },
	{ path: 'cursos', component: CursoComponent },
	{ path: 'recursos/:tipo', component: RecursoComponent },
	{ path: '**', component: UsuarioComponent }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);