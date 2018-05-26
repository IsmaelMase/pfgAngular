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
  public selectedFiles: FileList = undefined;
  public currentFileUpload: File = undefined;

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
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "");
  }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem("usuario")).rol !== "ROL_ADMIN") {
      this._router.navigate(["cursos"]);
    }
    this.getUsuarios();
    this.getCursos();
  }


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
    this.usuarioSeleccionado.password = "";
    this.modificando = true;
  }

  cancelar() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "");
    this.modificando = false;
  }

  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "");
    this.modificando = true;
  }

  saveUsuario(formulario) {
    this.usuarioSeleccionado.password = btoa(this.usuarioSeleccionado.password);
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        console.log(response);
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
        } else if (response.status === 409) {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeDuplicado("NIF");
        } else if (response.status === 406) {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeDuplicado("Email");
        } else {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        if (error.status === 409) {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeDuplicado("NIF");
        } else if (error.status === 406) {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeDuplicado("Email");
        } else {
          this.usuarioSeleccionado.password = "";
          this.mostrarMensajeIncorrecto();
        }
      }
    );
  }

  resetImage() {
    this.usuarioSeleccionado.imagen = "";
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
    if (this.selectedFiles !== undefined) {
      this.currentFileUpload = this.selectedFiles.item(0);
      this.uploadService.saveImage(this.currentFileUpload).subscribe(
        (response: any) => {
          console.log(response);
          if (response.status === 200) {
            this.usuarioSeleccionado.imagen = this.currentFileUpload.name;
            this.saveUsuario(formulario);
          } else if (response.status === 403) {
            localStorage.clear();
            this._router.navigate(["login"]);
          } else if (response.status === 302) {
            this.usuarioSeleccionado.imagen = this.currentFileUpload.name;
            this.saveUsuario(formulario);
          } else if (response.status || response.status === 0) {
            this.usuarioSeleccionado.password = "";
            this.msgs = [];
            this.mostrarMensajeIncorrectoImagen();
          }

        },
        error => {
          this.usuarioSeleccionado.password = "";
          console.log(error)
        }
      );
    } else {
      this.saveUsuario(formulario);
    }
  }


  removeUsuario(usuario: Usuario) {
    this._usuarioService.removeUsuario(usuario.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eliminarElementoArray();
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
      message: '¿Desea eliminar el usuario?',
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
    let usuario = this.usuarios.filter((u: Usuario) => u.id === response.json().id);
    if (usuario.length > 0) {
      this.usuarios[this.pos] = response.json();
    } else {
      this.usuarios.push(response.json());
    }
    this.pos = -1;
    console.log(this.usuarios)
  }

  eliminarElementoArray() {
    this.usuarios.splice(this.pos, 1);
  }

  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  mostrarMensajeIncorrectoImagen() {
    this.msgs = [];
    console.log("sdasdasda")
    this.msgs.push({ severity: 'error', summary: 'Error al subir la imagen' });
  }

  mostrarMensajeDuplicado(campo: string) {
    this.msgs = [];
    console.log("sdasdasda")
    this.msgs.push({ severity: 'error', summary: 'El campo ' + campo + ' ya esta registrado' });
  }

}
