import { Component, OnInit } from '@angular/core';
import { RecursoService } from '../servicios/recurso.service';
import { Recurso } from '../modelo/recurso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Reserva } from '../modelo/reserva';
import { Usuario } from '../modelo/usuario';
import { HorarioService } from "../servicios/horario.service";
import { Horario } from '../modelo/horario';
@Component({
  selector: 'recurso',
  templateUrl: '../vista/recurso/recurso.component.html',
  styleUrls: ['../vista/recurso/recurso.component.css']
})
export class RecursoComponent implements OnInit {
  public recursos: Recurso[];
  public recursoSeleccionado: Recurso;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public tipo: String;
  public pos: number = -1;
  public recursoReserva: Recurso;
  public opcionReservaSeleccionada: string;
  public usuario: Usuario;
  public intervalos:Horario;

  constructor(
    private _recursoService: RecursoService,
    private _route: ActivatedRoute,
    private _horarioService: HorarioService,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      this.tipo = params['tipo'];
      this.usuario = JSON.parse(localStorage.getItem("usuario"))
      if (this.tipo === 'aulas') {
        this.cambiarAulas();
      } else {
        this.cambiarOtros();
      }
      this.getHorasDisponibles();
    });
  }

  getHorasDisponibles() {
    this._horarioService.getHoras().subscribe(
      response => {
        if (response.status !== 403) {
          console.log(response.json());
          this.intervalos = response.json();
        } else {
          this._router.navigate(["login"]);
        }

      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getAulas() {
    this._recursoService.getAulas().subscribe(
      response => {
        this.recursos = response;
        console.log(this.recursos);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  imprimir(event){
    console.log(event.value);
    console.log(this.recursoSeleccionado);
  }

  getOtros() {
    this._recursoService.getOtros().subscribe(
      response => {
        this.recursos = response;
        console.log(this.recursos);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  seleccionarRecurso(recurso: Recurso) {
    this.pos = this.recursos.indexOf(recurso);
    for (let prop in recurso) {
      this.recursoSeleccionado[prop] = recurso[prop];
    }
    this.modificando = true;
  }

  cancelar() {
    if (this.tipo === 'aulas') {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a",null);
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r",null);
    }
    this.modificando = false;
  }

  abrirDialog() {
    if (this.tipo === 'aulas') {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a",null);
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r",null);
    } this.modificando = true;
  }

  abrirDialogReserva(recurso: Recurso,tipoDialog:string) {
    this.opcionReservaSeleccionada = tipoDialog;
    console.log(recurso);
    this.recursoReserva = recurso;
  }

  cerrarDialogReservas(e) {
    if (e === "cerrar") {
      this.opcionReservaSeleccionada = "";
      this.recursoReserva = null;
    } else if (e === "ok") {
      this.opcionReservaSeleccionada = "";
      this.recursoReserva = null;
      this.mostrarMensajeCorrecto();
    }
    else if (e === "fail") {
      this.opcionReservaSeleccionada = "";
      this.recursoReserva = null;
      this.mostrarMensajeIncorrecto();
    }
  }

  saveRecurso() {
    console.log(this.recursoSeleccionado)
    this._recursoService.addRecurso(this.recursoSeleccionado).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
          this.cancelar();
        } else {
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  removeRecurso(recurso: Recurso) {
    console.log(recurso)
    this._recursoService.removeRecurso(recurso.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eliminarElementoArray(recurso);
          this.cancelar();
        } else {
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
      message: '¿Desea elminiar el recurso?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeRecurso(this.recursoSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    console.log(this.recursos)
    if (this.pos !== -1) {
      this.recursos[this.pos] = response.json();
    } else {
      this.recursos.push(response.json());
    }
    this.pos = -1;
    console.log(this.recursos)
  }

  eliminarElementoArray(recurso: Recurso) {
    let pos = this.recursos.indexOf(recurso);
    this.recursos.splice(pos, 1);
  }

  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  cambiarAulas() {
    this.getAulas();
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a",null);
  }

  cambiarOtros() {
    this.getOtros();
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r",null);
  }
}
