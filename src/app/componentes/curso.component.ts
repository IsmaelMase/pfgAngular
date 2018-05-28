import { Component, OnInit } from '@angular/core';
import { CursoService } from '../servicios/curso.service';
import { Curso } from '../modelo/curso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'curso',
  templateUrl: '../vista/curso/curso.component.html',
  styleUrls: ['../vista/curso/curso.component.css']
})
export class CursoComponent implements OnInit {

  public cursos: Curso[] = [];
  public cursoSeleccionado: Curso;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public pos: number = -1;

  constructor(
    private _cursoService: CursoService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) {

  }

  ngOnInit() {
    this.getCursos();
    this.cursoSeleccionado = new Curso("", "");
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

  seleccionarCurso(curso: Curso) {
    this.pos = this.cursos.indexOf(curso);
    for (let prop in curso) {
      this.cursoSeleccionado[prop] = curso[prop];
    }
    this.modificando = true;
  }

  cancelar() {
    this.cursoSeleccionado = new Curso("", "");
    this.modificando = false;
  }

  abrirDialog() {
    this.cursoSeleccionado = new Curso("", "");
    this.modificando = true;
  }

  saveCurso() {
    console.log(this.cursoSeleccionado)
    this._cursoService.addCurso(this.cursoSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
          this.cancelar();
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

  removeCurso(curso: Curso) {
    this._cursoService.removeCurso(curso.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eliminarElementoArray(curso);
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
        console.log(error)
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

  confirmacionBorrado(curso: Curso) {
    this.confirmationService.confirm({
      message: '¿Desea elminiar el curso?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeCurso(this.cursoSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    let curso = this.cursos.filter((c: Curso) => c.id === response.json().id);
    if (curso.length > 0) {
      this.cursos[this.pos] = response.json();
    } else {
      this.cursos.push(response.json());
    }
    this.pos = -1;
  }

  eliminarElementoArray(curso: Curso) {
    this.cursos.splice(this.pos, 1);
  }


  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  mostrarMensajeNoPuedeBorrar() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', detail: 'El curso no puede ser borrado porque esta asignado a un usuario', summary: 'Eliminación cancelada' });
  }

}
