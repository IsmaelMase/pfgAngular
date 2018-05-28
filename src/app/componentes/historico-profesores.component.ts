import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { CursoService } from '../servicios/curso.service';
import { Usuario } from '../modelo/usuario';
import { Curso } from '../modelo/curso';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { UploadService } from '../servicios/upload.service';

@Component({
  selector: 'app-historico-profesores',
  templateUrl: '../vista/historico-profesores/historico-profesores.component.html',
  styleUrls: ['../vista/historico-profesores/historico-profesores.component.css']
})
export class HistoricoProfesoresComponent implements OnInit {

  public usuarios: Usuario[];
  public cursos: Curso[];
  public usuarioSeleccionado: Usuario;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public colsCursos: any[];
  public pos: number = -1;
  public selectedFiles: FileList = undefined;
  public currentFileUpload: File = undefined;
  public password: string;
  public loading:boolean;
  constructor(
    private _usuarioService: UsuarioService,
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
    this.password = "";
    this.getUsuarios();
    this.getCursos();
    this.loading=true;
  }


  getUsuarios() {
    this.loading=true;
    this._usuarioService.getAllUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
          this.loading=false;
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
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "",true);
    this.modificando = false;
    this.password = "";
  }

  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "",true);
    this.modificando = true;
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

  confirmacionBorrado() {
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
    this.usuarios[this.pos].estado=true;
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
