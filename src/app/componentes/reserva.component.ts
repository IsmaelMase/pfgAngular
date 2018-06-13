import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CursoService } from '../servicios/curso.service';
import { UsuarioService } from '../servicios/usuario.service';
import { ReservaService } from '../servicios/reserva.service';
import { HorarioService } from '../servicios/horario.service';
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
  public fechasSeleccionadas: string[];
  public horasDisponibles: string[];
  public reserva: Reserva;
  public fechaSeleccionada: Date;
  public reservaDiaria: boolean = false;
  public reservas: boolean = false;
  public fechasNoDisponibles: Array<Date>;
  public colsCursos: any[];
  public eventos: any[];
  public header: any;
  public mesMostrado: any = 0;
  public yearMostrado: number = 0;
  public diaMostrado: number = 0;
  public usuario: Usuario;
  public maxFechas: number;
  public reservaSeleccionada: Reserva;
  public pos: number = 0;
  public reservasAMostrar: any[] = [];
  public loading: boolean = false;
  public doingReserva: boolean = false;
  public haveFechas: boolean = false;
  constructor(
    private _reservaService: ReservaService,
    private _horarioService: HorarioService,
    private _usuarioService: UsuarioService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    registerLocaleData(localeEs, 'es', localeEsExtra);
    moment.lang("es");
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
    //se recoge el usuario de la cache
    this.usuario = JSON.parse(localStorage.getItem("usuario"))
    /**
     * Se comprueba si se ha seleccionado la ventana de realizar reservas o de visualizar reservas
     */
    if (this.dialog === "diaria") {
      /**
       * Se obtienen los usuarios
       */
      this.getUsuarios();
      //se comprueba el rol del usuario pra configuracion de la reservas
      if (this.usuario.rol === "ROL_PROFESOR") {
        this.reservaSeleccionada.usuario = this.usuario;
        this.maxFechas = 30;
      }
      this.reservaSeleccionada.recurso = this.recurso;
      //se establece la fecha maxima de reserva dependiendo del rol del usuario
      if (this.usuario.rol === 'ROL_ADMIN') {
        this.maxDate = new Date(this.recurso.intervalo.fecha_max);
      } else {
        let date = new Date();
        date.setMonth(date.getMonth() + 1);
        if (date > new Date(this.recurso.intervalo.fecha_max)) {
          this.maxDate = new Date(this.recurso.intervalo.fecha_max);
        } else {
          this.maxDate = date;
        }
      }
      this.reservaDiaria = true;
    } else if (this.dialog === "reservas") {
      this.mesMostrado = 0;
      this.header = {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      };
      this.getReservas("2018/05");
    }
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
    this.cols = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellidos' }
    ];
    this.colsCursos = [
      { field: 'nombre', header: 'Nombre' }
    ];
  }
  /**
   * Obtener reservas por fecha
   * @param fecha String fecha
   */
  getReservas(fecha) {

    this._reservaService.getReservasByRecursoAndFecha(this.recurso.id, fecha).subscribe(
      response => {
        console.log(response);
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
   * Evento cuando se selecciona una reservas
   * @param event Evento
   */
  clickeado(event) {
    if (this.mesMostrado !== Number(event.getDate()._d.getUTCMonth() + 1)) {
      this.loading = true;
      console.log(event.getDate()._d.getMonth())
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
   * Obtener fechas no disponibles
   */
  getFechasNoDisponibles() {
    this.haveFechas = false;
    console.log(this.reservaSeleccionada.intervalos_reservas.length === 0);
    this.fechasNoDisponibles = [];
    this._reservaService.getFechasNoDisponibles(this.reservaSeleccionada.intervalos_reservas, this.recurso.id).subscribe(
      response => {
        if (response.status !== 403) {
          for (let fecha in response.json()) {
            let fechaSeparada = response.json()[fecha].split("/")
            this.fechasNoDisponibles.push(new Date(fechaSeparada[0] + "-" + fechaSeparada[1] + "-" + fechaSeparada[2] + "T" + "00:00"));
          }
          console.log(this.fechasNoDisponibles);
          this.fechasNoDisponibles = [...this.fechasNoDisponibles];
          this.haveFechas = true;
        } else {
          localStorage.clear();
          this._router.navigate(["login"]);
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }
  /**
   * Obtener usuarios
   */
  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
          console.log(this.usuarios);
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
   * Abrir dialog para realizar reserva
   * @param recurso Recurso
   */
  abrirDialogReservaDiaria(recurso: Recurso) {
    this.reservaSeleccionada.recurso = recurso;
    this.getUsuarios();
    console.log(this.horasDisponibles);
  }
  /**
   * Transformar reservas en evento del calendario
   * @param reservas Reservas
   */
  trasnformarReservasEventos(reservas: Reserva[]) {
    this.eventos = [];
    let evento = {};

    let observableReservas = Observable.from(reservas);
    /* Se recorren las reservas con un Observable, se separan las horas y fechas y se crea el evento */
    observableReservas.map((reserva: Reserva) => {
      console.log(reserva)
      let horas = reserva.intervalos_reservas[0].split("-");
      let fechaSeparada = reserva.fechas_reservas[0].split("/")
      console.log(reserva);
      evento = {
        "title": reserva.usuario.nombre + " " + reserva.curso.nombre,
        "start": fechaSeparada[0] + "-" + fechaSeparada[1] + "-" + fechaSeparada[2] + "T" + horas[0],
        "end": fechaSeparada[0] + "-" + fechaSeparada[1] + "-" + fechaSeparada[2] + "T" + horas[1],
        "color": "#0767a3",
        "reserva": reserva
      }
      this.eventos.push(evento);
    }).finally(() => {
      this.getUsuarios();
      this.reservas = true;
      this.loading = false;
    }).subscribe();
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
  /**
   * Mostrar mensaje de error al realziar la reserva porque ya existe
   */
  mostrarMensajeConflicto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Alguna/s de las reservas ya estan ocupadas por otro usuario' });
  }
  /**
   * Mostrar mensaje de error al realziar la reserva porque ya existe para otro aula
   */
  mostrarMensajeUsuarioOcupado() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Reserva con fecha y hora existente para otro aula' });
  }
  /**
   * Cerrar dialog reservas
   */
  cancelar() {
    this.reservaDiaria = false;
    this.recurso = null;
    this.cerrar.emit("cerrar");
  }
  /**
   * Guardar reservas
   */
  saveReserva() {
    this.doingReserva = true;
    this._reservaService.addReserva(this.reservaSeleccionada).subscribe(
      response => {
        if (response.status === 201) {
          if (this.dialog == "diaria") {
            this.cerrar.emit("ok");
          } else {
            this.loading = true;
            this.getReservas(this.yearMostrado + "/" + this.mesMostrado);
            this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
            this.mostrarMensajeCorrecto();
          }
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          if (this.dialog == "diaria") {
            this.cerrar.emit("fail");
            this.mostrarMensajeIncorrecto();
          } else {
            this.mostrarMensajeIncorrecto();
          }
          this.doingReserva = false;
        }
        this.doingReserva = false;
      },
      error => {
        if (error.status === 409) {
          this.mostrarMensajeConflicto();
        } else if (error.status === 302) {
          this.mostrarMensajeUsuarioOcupado();
        } else {
          this.mostrarMensajeIncorrecto();
        }
        this.doingReserva = false;
      }
    );
  }
  /**
   * Seleccionar reserva
   * @param reserva Reserva
   */
  seleccionarReserva(reserva: Reserva) {
    console.log(reserva);
    this.pos = this.eventos.indexOf(reserva);
    for (let prop in reserva) {
      this.reservaSeleccionada[prop] = reserva[prop];
    }
    console.log(this.pos);
  }
  /**
   * Cerrar dialog para la modificacion de una reserva
   */
  cancelarBorrado() {
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }
  /**
   * Modificar reserva
   */
  updateReserva() {
    console.log(this.reservaSeleccionada);
    this._reservaService.addReserva(this.reservaSeleccionada).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.cancelarUpdate();
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          this.cancelarUpdate()
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
        console.log(response);
        if (response.status === 200) {
          this.cancelarUpdate();
          this.mostrarMensajeCorrecto();
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          this.cancelarUpdate()
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }
  /**
   * Borrar listado de reservas
   * @param ids String[] ids de las reservas
   */
  removeReservasMass(ids: string[]) {
    this.loading = true;
    this._reservaService.removeReservaMass(ids).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eventos = [];
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          this.mostrarMensajeIncorrecto();
          this.getReservas(this.yearMostrado + "/" + this.mesMostrado);
        }
        this.loading = false;
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }
  /**
   * Confirmacion de borrado
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
   * Confirmacion de borrado de listado de reservas
   */
  confirmacionBorradoMass() {
    this.confirmationService.confirm({
      message: '¿Desea cancelar todas las reservas del mes?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.cancelarReservasMensules();
      },
      reject: () => {
      }
    });
  }
  /**
   * Cancelar actualizado de reserva
   */
  cancelarUpdate() {
    this.getReservas(this.yearMostrado + "/" + this.mesMostrado);
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }
  /**
   * Eliminar reserva del array
   */
  eliminarElementoArray() {
    this.eventos.splice(this.pos, 1);
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }
  /**
   * Metodo previo a cancelar listado de reservas
   */
  cancelarReservasMensules() {
    let observableReservas = Observable.from(this.eventos);
    let ids: string[] = [];
    // se recorren todos los eventos y se recogen las reservas y sus ids
    observableReservas.map((evento: any) => {
      ids.push(evento.reserva.id);
    }).finally(() => {
      this.removeReservasMass(ids);
    }).subscribe();
  }
}
