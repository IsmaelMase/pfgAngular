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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { TabViewModule } from 'primeng/tabview';
import { SpinnerModule } from 'primeng/spinner';


import { CursoService } from './servicios/curso.service'
import { UsuarioService } from './servicios/usuario.service'
import { RecursoService } from './servicios/recurso.service'
import { HorarioService } from './servicios/horario.service'
import { ReservaService } from './servicios/reserva.service'
import { LoginService } from './servicios/login.service'
import { MensajeService } from './servicios/mensaje.service'

import { routing, appRoutingProviders } from './app.routing';
import { ConfirmationService } from 'primeng/api';


import { AppComponent } from './app.component';
import { CursoComponent } from './componentes/curso.component';
import { UsuarioComponent } from './componentes/usuario.component';
import { RecursoComponent } from './componentes/recurso.component';
import { ReservaComponent } from './componentes/reserva.component';
import { PantallaAppComponent } from './componentes/pantalla-app.component';
import { LoginComponent } from './componentes/login.component';
import { ReservaProfesorComponent } from './componentes/reserva-profesor.component';
import { MensajeComponent } from './componentes/mensaje.component';
import { ConfiguracionUsuarioComponent } from './componentes/configuracion-usuario.component';
import { HorarioComponent } from './componentes/horario.component';
import { GeneradorCalendarioComponent } from './componentes/generador-calendario.component';
import { UploadService } from './servicios/upload.service';
import { HttpClientModule } from '@angular/common/http';
import { HistoricoProfesoresComponent } from './componentes/historico-profesores.component';
import { Nombre } from './pipes/primeraLetraMayus.pipes';
import { HomeComponent } from './componentes/home.component';
import { SelectButtonModule } from 'primeng/selectbutton';



@NgModule({
  declarations: [
    AppComponent,
    CursoComponent,
    UsuarioComponent,
    RecursoComponent,
    ReservaComponent,
    PantallaAppComponent,
    LoginComponent,
    ReservaProfesorComponent,
    MensajeComponent,
    ConfiguracionUsuarioComponent,
    HorarioComponent,
    GeneradorCalendarioComponent,
    HistoricoProfesoresComponent,
    Nombre,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
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
    ProgressSpinnerModule,
    AutoCompleteModule,
    MessageModule,
    TabViewModule,
    SpinnerModule,
    SelectButtonModule
  ],
  providers: [CursoService, UsuarioService, RecursoService, HorarioService, ReservaService, appRoutingProviders, ConfirmationService, LoginService, MensajeService, HorarioService, UploadService],
  bootstrap: [AppComponent]
})
export class AppModule { }
