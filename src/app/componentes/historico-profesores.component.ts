import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { CursoService } from '../servicios/curso.service';
import { ReservaService } from '../servicios/reserva.service';
import { Usuario } from '../modelo/usuario';
import { Curso } from '../modelo/curso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { UploadService } from '../servicios/upload.service';
import { Reserva } from '../modelo/reserva';

@Component({
  selector: 'app-historico-profesores',
  templateUrl: '../vista/historico-profesores/historico-profesores.component.html',
  styleUrls: ['../vista/historico-profesores/historico-profesores.component.css']
})
export class HistoricoProfesoresComponent implements OnInit {

  public usuarios: Usuario[];
  public usuariosTotales: Usuario[];
  public cursos: Curso[];
  public reservas: Reserva[];
  public usuarioSeleccionado: Usuario;
  public modificando: boolean = false;
  public historialReservas: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public colsCursos: any[];
  public pos: number = -1;
  public loading: boolean;
  public loadingReservas: boolean = false;
  public es: any;
  public eventos: any[];
  public mesMostrado: any = 0;
  public yearMostrado: number = 0;
  public header: any;
  public reservaSeleccionada: Reserva;
  constructor(
    private _usuarioService: UsuarioService,
    private _reservaService: ReservaService,
    private _cursoService: CursoService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService,
    private uploadService: UploadService
  ) {
    this.cols = [
      { field: 'dni', header: 'DNI' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'email', header: 'Email' }
    ];
    this.colsCursos = [
      { field: 'nombre', header: 'Nombre' }
    ];

    this.header = {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    };
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
  }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem("usuario")).rol !== "ROL_ADMIN") {
      this._router.navigate(["cursos"]);
    }
    this.getUsuarios();
    this.getCursos();
    this.loading = true;
    this.loadingReservas = false,
      this.reservas = [];
  }


  getUsuarios() {
    this.loading = true;
    this._usuarioService.getAllUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
          this.usuariosTotales = response.json();
          this.loading = false;
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

  getReservas(fecha) {
    console.log(fecha);
    this._reservaService.getReservasByUsuarioAndFecha(this.usuarioSeleccionado.id, fecha).subscribe(
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

  clickeado(event) {
    if (this.mesMostrado !== Number(event.getDate()._d.getUTCMonth() + 1)) {
      this.loadingReservas = true;
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
      this.loadingReservas = false;
    }).subscribe();
  }

  getCursos() {
    this._cursoService.getCursos().subscribe(
      response => {
        if (response.status !== 403) {
          this.cursos = response.json();
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

  seleccionarUsuario(usuario: Usuario) {
    this.pos = this.usuarios.indexOf(usuario);
    for (let prop in usuario) {
      this.usuarioSeleccionado[prop] = usuario[prop];
    }
    this.modificando = true;
  }

  filter(campo, value) {
    if (campo === 'dni') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.dni.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'email') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.email.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'nombre') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.nombre.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'apellido') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.apellido.toUpperCase().includes(value.toUpperCase()));
    }

  }

  cancelar() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = false;
  }

  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = true;
  }

  abrirDialogReservas() {
    this.getReservas("2018/06");
    this.reservas = [];
    this.historialReservas = true;
  }

  seleccionarReserva(reserva: Reserva) {
    let reservas = this.eventos.filter((e: any) => e.reserva.id === reserva.id);
    this.pos = this.eventos.indexOf(reservas[0]);
    for (let prop in reserva) {
      this.reservaSeleccionada[prop] = reserva[prop];
    }
    console.log(this.pos);
  }

  cancelarDialogReservas() {
    this.historialReservas = false;
  }

  darAlta(usuario: Usuario) {
    this._usuarioService.removeUsuario(usuario.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.cambiarEstado();
          this.cancelar();
        } else if (response.status === 403) {
          this._router.navigate(["login"]);
        } else {
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  confirmarDarAlta() {
    this.confirmationService.confirm({
      message: '¿Desea dar de alta el usuario?',
      header: 'Confirmacion alta',
      icon: 'fa fa-check',
      accept: () => {
        this.darAlta(this.usuarioSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    let usuario = this.usuarios.filter((u: Usuario) => u.id === response.json().id);
    if (usuario.length > 0) {
      this.usuarios[this.pos] = response.json();
    } else {
      this.usuarios.push(response.json());
    }
    this.pos = -1;
    console.log(this.usuarios)
  }

  cambiarEstado() {
    this.usuarios[this.pos].estado = true;
  }

  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  removeReserva(reserva: Reserva) {
    this._reservaService.removeReserva(reserva.id).subscribe(
      response => {
        if (response.status === 200) {
          this.cancelarReserva();
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

  saveReserva() {
    this._reservaService.addReserva(this.reservaSeleccionada).subscribe(
      response => {
        console.log(response.json())
        if (response.status === 201) {
          this.cancelarReserva();
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

  cancelarReserva() {
    this.reservaSeleccionada = new Reserva("", [], [], null, null, null, "");
  }

  eliminarElementoArray() {
    console.log(this.pos);
    this.eventos.splice(this.pos, 1);
    this.pos = -1
    this.cancelar()
  }

}
