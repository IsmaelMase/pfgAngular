import { Component, OnInit } from '@angular/core';
import { RecursoService } from '../servicios/recurso.service';
import { Recurso } from '../modelo/recurso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Reserva } from '../modelo/reserva';

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

  constructor(
    private _recursoService: RecursoService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      this.tipo = params['tipo'];

      if (this.tipo === 'aulas') {
        this.cambiarAulas();
      } else {
        this.cambiarOtros();
      }
    });
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
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a");
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r");
    }
    this.modificando = false;
  }

  abrirDialog() {
    if (this.tipo === 'aulas') {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a");
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r");
    } this.modificando = true;
  }

  abrirDialogReservaDiaria(recurso: Recurso) {
    this.opcionReservaSeleccionada = "diaria";
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
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a");
  }

  cambiarOtros() {
    this.getOtros();
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r");
  }
}
