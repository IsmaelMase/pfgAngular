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
import { UploadService } from '../servicios/upload.service';
import { CONSTANTS } from '../servicios/serviceConstants';

@Component({
  selector: 'recurso',
  templateUrl: '../vista/recurso/recurso.component.html',
  styleUrls: ['../vista/recurso/recurso.component.css']
})
export class RecursoComponent implements OnInit {
  public url = CONSTANTS.url;
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
  public intervalos: Horario;
  public selectedFiles: FileList;
  public currentFileUpload: File;
  public loading: boolean = true;
  public titulo: string;
  public order: number=1;
  public opcionesOrdenar: any[];
  public opcionSeleccionada:string;
  constructor(
    private _recursoService: RecursoService,
    private _route: ActivatedRoute,
    private _horarioService: HorarioService,
    private _router: Router,
    private confirmationService: ConfirmationService,
    private uploadService: UploadService

  ) { }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      this.tipo = params['tipo'];
      this.usuario = JSON.parse(localStorage.getItem("usuario"))
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a", null, "");
      this.opcionesOrdenar = [
        { label: 'A-Z', value: 'nombre1' },
        { label: 'Z-A', value: 'nombre2' }
      ];
      this.opcionSeleccionada='nombre1';
      this.getHorasDisponibles();
    });
  }

  getHorasDisponibles() {
    this._horarioService.getHoras().subscribe(
      response => {
        if (response.status !== 403) {
          console.log(response.json());
          this.intervalos = response.json();
          this.getRecursos();
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

  getAulas() {
    this.loading = true;
    this._recursoService.getAulas().subscribe(
      response => {
        if (response.status !== 403) {
          this.recursos = response;
          this.loading = false;
          this.ordenar();
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

  imprimir(event) {
    console.log(event.value);
    console.log(this.recursoSeleccionado);
  }

  getOtros() {
    this.loading = true;
    this._recursoService.getOtros().subscribe(
      response => {
        if (response.status !== 403) {
          this.recursos = response;
          this.loading = false;
          this.ordenar();
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

  getRecursos() {
    if (this.tipo === 'aulas') {
      this.cambiarAulas();
      this.titulo = "Aulas";
    } else {
      this.cambiarOtros();
      this.titulo = "Recursos";
    }
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
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a", null, "");
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r", null, "");
    }
    this.modificando = false;
  }

  abrirDialog() {
    if (this.tipo === 'aulas') {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a", null, "");
    } else {
      this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r", null, "");
    }
    this.modificando = true;
  }

  abrirDialogReserva(recurso: Recurso, tipoDialog: string) {
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

  saveRecurso(formulario) {
    console.log(this.recursoSeleccionado)
    this._recursoService.addRecurso(this.recursoSeleccionado).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
          this.cancelar();
          formulario.reset();
          this.currentFileUpload = null;
          this.selectedFiles = undefined;
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          this.mostrarMensajeIncorrecto();
          this.cancelar();
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
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else if (response.status === 409) {
          this.mostrarMensajeNoPuedeBorrar();
          this.cancelar();
        } else {
          this.mostrarMensajeIncorrecto();
          this.cancelar();
        }
      },
      error => {
        if (error.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else if (error.status === 409) {
          this.mostrarMensajeNoPuedeBorrar();
          this.cancelar();
        } else {
          this.mostrarMensajeIncorrecto();
          this.cancelar();
        }
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
    let recurso = this.recursos.filter((r: Recurso) => r.id === response.json().id);
    if (recurso.length > 0) {
      this.recursos[this.pos] = response.json();
    } else {
      this.recursos.push(response.json());
    }
    this.pos = -1;
    this.recursos = [...this.recursos];
  }

  resetImage() {
    this.recursoSeleccionado.imagen = "";
    this.currentFileUpload = null;
    this.selectedFiles = undefined;
  }

  selectFile(event) {
    console.log(event);
    let file = event.target.files.item(0);

    if (file.type.match('image.*')) {
      this.selectedFiles = event.target.files;
    }
  }

  upload(formulario) {
    console.log(this.selectedFiles)
    if (this.selectedFiles !== undefined) {
      this.currentFileUpload = this.selectedFiles.item(0);
      this.uploadService.saveImage(this.currentFileUpload).subscribe(
        (response: any) => {
          console.log(response);
          if (response.status === 200) {
            this.recursoSeleccionado.imagen = this.currentFileUpload.name;
            this.saveRecurso(formulario);
          } else if (response.status === 403) {
            console.log("2")
            localStorage.clear();
            this._router.navigate(["login"]);
          } else if (response.status === 302) {
            console.log("3")
            this.recursoSeleccionado.imagen = this.currentFileUpload.name;
            this.saveRecurso(formulario);
          } else if (response.status) {
            console.log("4")
            this.msgs = [];

            this.mostrarMensajeIncorrectoImagen();
            this.recursoSeleccionado.imagen = "";
          }

        },
        error => {
          console.log(error)
        }
      );
    } else {
      this.saveRecurso(formulario);
    }
  }

  eliminarElementoArray(recurso: Recurso) {
    this.recursos.splice(this.pos, 1);
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
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "a", null, "");
  }

  cambiarOtros() {
    this.getOtros();
    this.recursoSeleccionado = new Recurso("", "", "", "", 0, "r", null, "");
  }

  mostrarMensajeIncorrectoImagen() {
    this.msgs = [];
    console.log("sdasdasda")
    this.msgs.push({ severity: 'error', summary: 'Error al subir la imagen' });
  }

  mostrarMensajeNoPuedeBorrar() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', detail: 'El recurso no puede ser borrado porque tiene reservas realizadas', summary: 'Eliminación cancelada' });
  }

  ordenar() {
    if (this.opcionSeleccionada === "nombre1") {
      this.recursos.sort(this.ordenarAZ);
    } else if (this.opcionSeleccionada === "nombre2") {
      this.recursos.sort(this.ordenarZA);
    }
  }

  ordenarAZ(a, b) {
    if (a.nombre.toLowerCase() < b.nombre.toLowerCase())
      return -1;
    if (a.nombre.toLowerCase() > b.nombre.toLowerCase())
      return 1;
    return 0;
  }
  ordenarZA(a, b) {
    if (a.nombre.toLowerCase() > b.nombre.toLowerCase())
      return -1;
    if (a.nombre.toLowerCase() < b.nombre.toLowerCase())
      return 1;
    return 0;
  }
}
