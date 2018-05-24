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
  public selectedFiles: FileList;
  public currentFileUpload: File;

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
    this.getCursos();
    this.usuarioSeleccionado = JSON.parse(localStorage.getItem("usuario"))
    this.usuarioSeleccionado.password = "";
  }

  getCursos() {
    this._cursoService.getCursos().subscribe(
      response => {
        if (response.status !== 403) {
          this.cursos = response.json();
        } else {
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


  saveUsuario(formulario, imagen) {
    console.log(imagen);
    if (imagen) {
      this.usuarioSeleccionado.imagen = imagen.name;
    }
    this.usuarioSeleccionado.password = btoa(this.usuarioSeleccionado.password);
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        if (response.status === 201) {
          localStorage.setItem("usuario", JSON.stringify(response.json()))
          this.currentFileUpload = null;
          this.selectedFiles = undefined;
          this.cerrar.emit("ok");
        } else if (response.status === 403) {
          this._router.navigate(["login"]);
        } else {
          this.cerrar.emit("fail");
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }
  selectFile(event) {
    let file = event.target.files.item(0);

    if (file.type.match('image.*')) {
      this.selectedFiles = event.target.files;
    } else {
      alert('invalid format!');
    }
  }

  upload(formulario) {

    this.currentFileUpload = this.selectedFiles.item(0);
    this.uploadService.saveImage(this.currentFileUpload).subscribe(
      (response: any) => {
        console.log(response);
        if (response.status === 200) {
          this.saveUsuario(formulario, this.currentFileUpload);
        } else if (response.status === 403) {
          this._router.navigate(["login"]);
        } else if (response.status === 302) {
          this.saveUsuario(formulario, this.currentFileUpload);
        } else if (response.status) {
          this.msgs = [];
          this.mostrarMensajeIncorrectoImagen();
        }

      },
      error => {
        console.log(error)
      }
    );
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

}

