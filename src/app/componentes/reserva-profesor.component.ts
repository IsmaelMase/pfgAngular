import { Component, OnInit } from '@angular/core';
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
  public mesMostrado: any = 0;
  public usuario: Usuario;
  public maxFechas: number;
  public yearMostrado: number = 0;
  public reservaSeleccionada: Reserva;
  public pos: number = 0;
  public loading: boolean = false;
  constructor(
    private _reservaService: ReservaService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem("usuario")).rol === "ROL_ADMIN") {
      this._router.navigate(["pantallaApp/inicio"]);
    }
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
    this.getReservas("2018/05");

    this.es = {
      firstDayOfWeek: 1,
      dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      today: 'Hoy',
      clear: 'Borrar'
    }
  }


  /**
   * Obtener Reservas
   * @param fecha String fecha
   */
  getReservas(fecha) {
    this._reservaService.getReservasByUsuarioAndFecha(this.usuario.id, fecha).subscribe(
      response => {
        if (response.status !== 403) {
          this.trasnformarReservasEventos(response.json());
        } else {
          localStorage.clear();
          this._router.navigate(["login"]);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  /**
   * Seleccionas una reserva
   * @param event Event
   */
  clickeado(event) {
    this.loading = true;
    if (this.mesMostrado !== Number(event.getDate()._d.getUTCMonth() + 1)) {
      this.mesMostrado = Number(event.getDate()._d.getUTCMonth() + 1)
      this.yearMostrado = Number(event.getDate()._d.getFullYear())

      if (Number(event.getDate()._d.getUTCMonth() + 1) < 10) {
        this.mesMostrado = "0" + this.mesMostrado;
        this.getReservas(this.yearMostrado + "/" + this.mesMostrado);

      } else {
        this.getReservas(this.yearMostrado + "/" + this.mesMostrado);
      }
    }
  }
  /**
   * Transformar reservas en evento para el calendario
   * @param reservas Reserva
   */
  trasnformarReservasEventos(reservas: Reserva[]) {
    this.eventos = [];
    let evento = {};

    let observableReservas = Observable.from(reservas);

    observableReservas.map((reserva: Reserva) => {
      let horas = reserva.intervalos_reservas[0].split("-");
      let fechaSeparada = reserva.fechas_reservas[0].split("/")
      evento = {
        "title": reserva.recurso.nombre,
        "start": fechaSeparada[0] + "-" + fechaSeparada[1] + "-" + fechaSeparada[2] + "T" + horas[0],
        "end": fechaSeparada[0] + "-" + fechaSeparada[1] + "-" + fechaSeparada[2] + "T" + horas[1],
        "color": "#0767a3",
        "reserva": reserva
      }
      this.eventos.push(evento);
    }).finally(() => {
      this.loading = false;
    }).subscribe();
  }
  /**
   * Seleccionar reserva
   * @param reserva Reserva
   */
  seleccionarReserva(reserva: Reserva) {
    let reservas = this.eventos.filter((e: any) => e.reserva.id === reserva.id);
    this.pos = this.eventos.indexOf(reservas[0]);
    for (let prop in reserva) {
      this.reservaSeleccionada[prop] = reserva[prop];
    }
  }
  /**
   * Guardar reserva
   */
  saveReserva() {
    this._reservaService.addReserva(this.reservaSeleccionada).subscribe(
      response => {
        if (response.status === 201) {
          this.cancelar();
          this.loading = true;
          this.getReservas(this.yearMostrado + "/" + this.mesMostrado);
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          localStorage.clear();
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
  /**
   * Borrar reserva
   * @param reserva Reserva
   */
  removeReserva(reserva: Reserva) {
    this._reservaService.removeReserva(reserva.id).subscribe(
      response => {
        if (response.status === 200) {
          this.cancelar();
          this.eliminarElementoArray();
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          localStorage.clear();
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
  /**
   * Confirmar borrado
   */
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
  /**
   * Cerrar dialog reserva
   */
  cancelar() {
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }
  /**
   * Eliminar reserva del array
   */
  eliminarElementoArray() {
    this.eventos.splice(this.pos, 1);
    this.pos = -1
    this.cancelar()
  }

  /**
   * Mostrar mensaje operacion correcto
   */
  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }
  /**
   * Mostrar mensaje error en la operacion
   */
  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

}
