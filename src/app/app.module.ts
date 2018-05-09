import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { GrowlModule } from 'primeng/growl';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { ScheduleModule } from 'primeng/schedule';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


import { CursoService } from './servicios/curso.service'
import { UsuarioService } from './servicios/usuario.service'
import { RecursoService } from './servicios/recurso.service'
import { HorarioService } from './servicios/horarios.service'
import { ReservaService } from './servicios/reserva.service'

import { routing, appRoutingProviders } from './app.routing';
import { ConfirmationService } from 'primeng/api';


import { AppComponent } from './app.component';
import { CursoComponent } from './componentes/curso.component';
import { UsuarioComponent } from './componentes/usuario.component';
import { RecursoComponent } from './componentes/recurso.component';
import { ReservaComponent } from './componentes/reserva.component';



@NgModule({
  declarations: [
    AppComponent,
    CursoComponent,
    UsuarioComponent,
    RecursoComponent,
    ReservaComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    TableModule,
    ToolbarModule,
    ScrollPanelModule,
    PanelModule,
    DataViewModule,
    DropdownModule,
    CardModule,
    GrowlModule,
    DialogModule,
    MultiSelectModule,
    routing,
    ConfirmDialogModule,
    InputTextareaModule,
    CalendarModule,
    ScheduleModule,
    ProgressSpinnerModule
  ],
  providers: [CursoService, UsuarioService, RecursoService, HorarioService, ReservaService, appRoutingProviders, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
