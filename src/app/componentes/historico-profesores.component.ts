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
  public loadingReservas: boolean;
  public es: any;
  public eventos: any[];
  public mesMostrado: any = 0;
  public yearMostrado: number = 0;

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
    
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
  }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem("usuario")).rol !== "ROL_ADMIN") {
      this._router.navigate(["cursos"]);
    }
    this.getUsuarios();
    this.getCursos();
    this.loading = true;
    this.reservas = [];
  }


  getUsuarios() {
    this.loading = true;
    this._usuarioService.getAllUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
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
    this._reservaService.getReservasByUsuarioAndFecha(this.usuarioSeleccionado.id, fecha).subscribe(
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

  clickeado(event) {
    this.loadingReservas = true;
    if (this.mesMostrado !== Number(event.getDate()._d.getUTCMonth() + 1)) {
      this.mesMostrado = Number(event.getDate()._d.getUTCMonth() + 1)
      this.yearMostrado = Number(event.getDate()._d.getFullYear())

      if (Number(event.getDate()._d.getUTCMonth() + 1) < 10) {
        this.mesMostrado = "0" + this.mesMostrado;
        this.getReservas(this.mesMostrado + "/" + this.yearMostrado);

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
      evento = {
        "title": reserva.recurso.nombre,
        "start": fechaSeparada[2] + "-" + fechaSeparada[1] + "-" + fechaSeparada[0] + "T" + horas[0],
        "end": fechaSeparada[2] + "-" + fechaSeparada[1] + "-" + fechaSeparada[0] + "T" + horas[1],
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

  cancelar() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = false;
  }

  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = true;
  }

  abrirDialogReservas() {
    this.getReservas("05");
    this.reservas = [];
    this.historialReservas=true;
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

}
