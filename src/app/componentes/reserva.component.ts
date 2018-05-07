import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CursoService } from '../servicios/curso.service';
import { UsuarioService } from '../servicios/usuario.service';
import { ReservaService } from '../servicios/reserva.service';
import { HorarioService } from '../servicios/horarios.service';
import { Recurso } from '../modelo/recurso';
import { Curso } from '../modelo/curso';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Reserva } from '../modelo/reserva';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFrExtra from '@angular/common/locales/extra/es';
registerLocaleData(localeEs, 'es', localeFrExtra);

@Component({
  selector: 'reserva',
  templateUrl: '../vista/reserva/reserva.component.html',
  styleUrls: ['../vista/reserva/reserva.component.css']
})
export class ReservaComponent implements OnInit {
  @Input('dialog') dialog: string;
  @Input('recurso') recurso: Recurso;
  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();

  public usuarios: Usuario[];
  public msgs: Message[] = [];
  public cols: any[];
  public minDate = new Date();
  public maxDate = new Date();
  public es: any;
  public horasDisponibles: string[];
  public reserva: Reserva;
  public fechaSeleccionada: Date;
  public reservaDiaria: boolean = false;
  public reservas: boolean = false;
  public fechasNoDisponibles: Array<Date>;
  public colsCursos: any[];
  public colsReservas: any[];
  public reservasList: Reserva[];


  constructor(
    private _reservaService: ReservaService,
    private _horarioService: HorarioService,
    private _usuarioService: UsuarioService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    if (this.dialog === "diaria") {
      this.reserva = new Reserva("", [], [], null, null, null, "");
      this.reserva.recurso = this.recurso;
      this.getHorasDisponibles();
      this.reservaDiaria = true;
    } else if (this.dialog === "reservas") {
      this.reservas = true;
      this.getReservas();
    }
    this.maxDate.setFullYear(this.minDate.getFullYear() + 1);
    this.es = {
      firstDayOfWeek: 1,
      dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      today: 'Hoy',
      clear: 'Borrar'
    }
    this.cols = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' }
    ];
    this.colsCursos = [
      { field: 'nombre', header: 'Nombre' }
    ];
    this.colsReservas = [
      { header: 'Usuario' },
      { header: 'Fecha' },
      { header: 'Hora' },

    ];
  }

  getHorasDisponibles() {
    this._horarioService.getHoras().subscribe(
      response => {
        this.horasDisponibles = response;
        this.getUsuarios();
        console.log(this.horasDisponibles);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getReservas() {
    this._reservaService.getReservasByRecurso(this.recurso.id).subscribe(
      response => {
        console.log(response);
        this.reservasList = response;
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getFechasNoDisponibles() {
    this.fechasNoDisponibles = [];
    this._reservaService.getFechasNoDisponibles(this.reserva.intervalos_reservas, this.recurso.id).subscribe(
      response => {
        console.log(response);
        for (let fecha in response) {
          console.log(response[fecha]);
          this.fechasNoDisponibles.push(new Date(response[fecha]));
        }
        this.fechasNoDisponibles = [...this.fechasNoDisponibles];
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }


  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe(
      response => {
        this.usuarios = response;
        console.log(this.usuarios);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  abrirDialogReservaDiaria(recurso: Recurso) {
    this.reserva.recurso = recurso;
    this.getHorasDisponibles();
    this.getUsuarios();
    console.log(this.horasDisponibles);
  }


  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  cancelar() {
    this.reservaDiaria = false;
    this.recurso = null;
    this.cerrar.emit("cerrar");
  }

  saveReserva() {
    console.log(this.reserva)
    this._reservaService.addReserva(this.reserva).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.cerrar.emit("ok");
        } else {
          this.cerrar.emit("fail");
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

}
