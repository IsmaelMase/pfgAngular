import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  selector: 'configuracion-usuario',
  templateUrl: '../vista/configuracion-usuario/configuracion-usuario.component.html',
  styleUrls: ['../vista/configuracion-usuario/configuracion-usuario.component.css']
})
export class ConfiguracionUsuarioComponent implements OnInit {
  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();

  public usuarios: Usuario[];
  public cursos: Curso[];
  public usuarioSeleccionado: Usuario;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public colsCursos: any[];
  public abierto: boolean = true;
  public cambioPass: boolean = false;
  public selectedFiles: FileList;
  public currentFileUpload: File;
  public password: string;
  constructor(
    private _usuarioService: UsuarioService,
    private _cursoService: CursoService,
    private _route: ActivatedRoute,
    private _router: Router,
    private uploadService: UploadService
  ) {
    this.colsCursos = [
      { field: 'nombre', header: 'Nombre' }
    ];
  }

  ngOnInit() {
    this.abierto = true;
    this.cambioPass = false;
    this.password = "";
    this.getCursos();
    this.usuarioSeleccionado = JSON.parse(localStorage.getItem("usuario"))
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

  cancelar() {
    this.abierto = false;
    this.cerrar.emit("cerrar");
  }

  abrirDialogPass() {
    this.password = "";
    this.cambioPass = true;
  }

  cancelarCambioPass() {
    this.password = "";
    this.cambioPass = false;
  }

  setPassword() {
    if (this.password !== "") {
      this.usuarioSeleccionado.password = btoa(this.password);
    }
    this.cambioPass = false;
  }


  saveUsuario(formulario) {
    console.log(this.usuarioSeleccionado.password);
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        if (response.status === 201) {
          localStorage.setItem("usuario", JSON.stringify(response.json()))
          this.currentFileUpload = null;
          this.selectedFiles = undefined;
          this.cerrar.emit("ok");
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

