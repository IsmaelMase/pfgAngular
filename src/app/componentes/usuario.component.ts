import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { CursoService } from '../servicios/curso.service';
import { Usuario } from '../modelo/usuario';
import { Curso } from '../modelo/curso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';


@Component({
  selector: 'usuario',
  templateUrl: '../vista/usuario/usuario.component.html',
  styleUrls: ['../vista/usuario/usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public usuarios: Usuario[];
  public cursos: Curso[];
  public usuarioSeleccionado: Usuario;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public colsCursos: any[];
  public pos: number = -1;

  constructor(
    private _usuarioService: UsuarioService,
    private _cursoService: CursoService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
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
  }

  ngOnInit() {
    this.getUsuarios();
    this.getCursos();
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", []);
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

  getCursos() {
    this._cursoService.getCursos().subscribe(
      response => {
        this.cursos = response;
        console.log(this.cursos);
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
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", []);
    this.modificando = false;
  }

  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", []);
    this.modificando = true;
  }

  saveUsuario(formulario) {
    console.log(this.usuarioSeleccionado)
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
          this.cancelar();
          formulario.reset();
        } else {
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  removeUsuario(usuario: Usuario) {
    this._usuarioService.removeUsuario(usuario.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eliminarElementoArray(usuario);
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
      message: '¿Desea elminiar el usuario?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeUsuario(this.usuarioSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    console.log(this.usuarios)
    if (this.pos !== -1) {
      this.usuarios[this.pos] = response.json();
    } else {
      this.usuarios.push(response.json());
    }
    this.pos = -1;
    console.log(this.usuarios)
  }

  eliminarElementoArray(usuario: Usuario) {
    let pos = this.usuarios.indexOf(usuario);
    this.usuarios.splice(pos, 1);
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
