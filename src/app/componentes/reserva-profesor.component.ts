import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReservaService } from '../servicios/reserva.service';
import { Recurso } from '../modelo/recurso';
import { Curso } from '../modelo/curso';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Rx';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Reserva } from '../modelo/reserva';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import * as moment from 'moment';


@Component({
  selector: 'reserva-profesor',
  templateUrl: '../vista/reserva-profesor/reserva-profesor.component.html',
  styleUrls: ['../vista/reserva-profesor/reserva-profesor.component.css']
})
export class ReservaProfesorComponent implements OnInit {
  public msgs: Message[] = [];
  public es: any;
  public eventos: any[];
  public header: any;
  public mesMostrado: number = 0;
  public usuario: Usuario;
  public maxFechas: number;
  public yearMostrado: number = 0;
  public reservaSeleccionada: Reserva;
  public pos: number = 0;

  constructor(
    private _reservaService: ReservaService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    registerLocaleData(localeEs, 'es', localeEsExtra);
    moment.lang("es");
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
    this.usuario = this.usuario = JSON.parse(localStorage.getItem("usuario"));
    this.mesMostrado = 0;
    this.header = {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    };
    this.getReservas("05");

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
  }



  getReservas(fecha) {
    this._reservaService.getReservasByUsuarioAndFecha(this.usuario.id, fecha).subscribe(
      response => {
        if (response.status !== 403) {
          this.trasnformarReservasEventos(response.json());
        } else {
          this._router.navigate(["login"]);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  clickeado(event) {
    console.log(event)
    if (this.mesMostrado !== Number(event.getDate()._d.getUTCMonth() + 1)) {
      console.log(event.getDate()._d.getMonth())
      this.mesMostrado = Number(event.getDate()._d.getUTCMonth() + 1)
      this.yearMostrado = Number(event.getDate()._d.getFullYear())

      if (Number(event.getDate()._d.getUTCMonth() + 1) < 10) {
        this.getReservas("0" + this.mesMostrado + "/" + this.yearMostrado);

      } else {
        this.getReservas(this.mesMostrado + "/" + this.yearMostrado);

      }
    }
  }

  trasnformarReservasEventos(reservas: Reserva[]) {
    this.eventos = [];
    let evento = {};

    let observableReservas = Observable.from(reservas);

    observableReservas.map((reserva: Reserva) => {
      let horas = reserva.intervalos_reservas[0].split("-");
      let fechaSeparada = reserva.fechas_reservas[0].split("/")
      console.log(reserva);
      evento = {
        "title": reserva.recurso.nombre,
        "start": fechaSeparada[2] + "-" + fechaSeparada[1] + "-" + fechaSeparada[0] + "T" + horas[0],
        "end": fechaSeparada[2] + "-" + fechaSeparada[1] + "-" + fechaSeparada[0] + "T" + horas[1],
        "color": "#0767a3",
        "reserva": reserva
      }
      this.eventos.push(evento);
    }).finally(() => {
      console.log(this.eventos)
    }).subscribe();
  }

  seleccionarReserva(reserva: Reserva) {
    this.pos = this.eventos.indexOf(reserva);
    for (let prop in reserva) {
      this.reservaSeleccionada[prop] = reserva[prop];
    }
  }

  saveReserva() {
    this._reservaService.addReserva(this.reservaSeleccionada).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.cancelar();
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          this._router.navigate(["login"]);
        } else {
          this.cancelar()
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  removeReserva(reserva: Reserva) {
    this._reservaService.removeReserva(reserva.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.eliminarElementoArray();
          this.cancelar();
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          this._router.navigate(["login"]);
        } else {
          this.cancelar()
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  confirmacionBorrado() {
    this.confirmationService.confirm({
      message: '¿Desea cancelar la reserva?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeReserva(this.reservaSeleccionada);
      },
      reject: () => {
      }
    });
  }

  cancelar() {
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }
  eliminarElementoArray() {
    this.eventos.splice(this.pos, 1);
    this.cancelar()
  }

  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

}
