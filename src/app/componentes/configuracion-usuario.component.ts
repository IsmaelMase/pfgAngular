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
import { CONSTANTS } from '../servicios/serviceConstants';
import * as firebase from 'firebase';

@Component({
  selector: 'configuracion-usuario',
  templateUrl: '../vista/configuracion-usuario/configuracion-usuario.component.html',
  styleUrls: ['../vista/configuracion-usuario/configuracion-usuario.component.css']
})
export class ConfiguracionUsuarioComponent implements OnInit {
  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();
  /**
   * Variables
   */
  public url = CONSTANTS.url
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
  public doingRegistro: boolean;
  /**
   * Constructor
   * @param _usuarioService UsuarioService
   * @param _cursoService  CursoService
   * @param _route ActivatedRoute
   * @param _router Router
   * @param uploadService UploadService
   */
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
  /**
   * Metodo iniciar vista
   */
  ngOnInit() {
    this.abierto = true;
    this.cambioPass = false;
    this.password = "";
    this.getCursos();
    this.usuarioSeleccionado = JSON.parse(localStorage.getItem("usuario"));
    this.doingRegistro = false;
  }
  /**
   * Obtener cursos
   */
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
  /**
   * Cerra dialog
   */
  cancelar() {
    this.abierto = false;
    this.cerrar.emit("cerrar");
  }
  /**
   * Abrir dialog password
   */
  abrirDialogPass() {
    this.password = "";
    this.cambioPass = true;
  }
  /**
   * Cerrar dialog password
   */
  cancelarCambioPass() {
    this.password = "";
    this.cambioPass = false;
  }
  /**
   * Introducir password
   */
  setPassword() {
    if (this.password !== "") {
      this.usuarioSeleccionado.password = btoa(this.password);
    }
    this.cambioPass = false;
  }

  /**
   * Guardar datos
   * @param formulario ngForm
   */
  saveUsuario(formulario) {
    this.selectedFiles = undefined;
    console.log(this.usuarioSeleccionado.password);
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          console.log("hola");
          localStorage.setItem("usuario", JSON.stringify(response.json()))
          this.currentFileUpload = null;
          this.selectedFiles = undefined;
          this.cerrar.emit("ok");
          this.doingRegistro = false;
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else if (response.status === 409) {
          this.doingRegistro = false;
          this.mostrarMensajeDuplicado("NIF");
        } else if (response.status === 406) {
          this.doingRegistro = false;
          this.mostrarMensajeDuplicado("Email");
        } else {
          this.doingRegistro = false;
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        if (error.status === 409) {
          this.doingRegistro = false;
          this.mostrarMensajeDuplicado("NIF");
        } else if (error.status === 406) {
          this.doingRegistro = false;
          this.mostrarMensajeDuplicado("Email");
        } else {
          this.doingRegistro = false;
          this.mostrarMensajeIncorrecto();
        }
      }
    );
  }
  /**
   * Cambiar imagen usuario por defecto
   */
  resetImage() {
    this.usuarioSeleccionado.imagen = "";
    this.currentFileUpload = null;
    this.selectedFiles = undefined;
  }
  /**
   * Seleccionar imagenes
   * @param event Event seleccion de imagen
   */
  selectFile(event) {
    console.log(event);
    let file = event.target.files.item(0);

    if (file.type.match('image.*')) {
      this.selectedFiles = event.target.files;
    }
  }
  /**
   * Subir imagen
   * @param formulario ngForm
   */
  upload(formulario) {
    this.doingRegistro = true;
    if (this.selectedFiles !== undefined) {
      this.currentFileUpload = this.selectedFiles.item(0);
      // this.uploadService.saveImage(this.currentFileUpload).subscribe(
      //   (response: any) => {
      //     console.log(response);
      //     if (response.status === 200) {
      //       this.usuarioSeleccionado.imagen = this.currentFileUpload.name;
      //       this.saveUsuario(formulario);
      //     } else if (response.status === 403) {
      //       localStorage.clear();
      //       this._router.navigate(["login"]);
      //     } else if (response.status === 302) {
      //       this.usuarioSeleccionado.imagen = this.currentFileUpload.name;
      //       this.saveUsuario(formulario);
      //     } else if (response.status || response.status === 0) {
      //       this.usuarioSeleccionado.password = "";
      //       this.msgs = [];
      //       this.mostrarMensajeIncorrectoImagen();
      //     }

      //   },
      //   error => {
      //     this.usuarioSeleccionado.password = "";
      //     console.log(error)
      //   }
      // );
      let nombre = this.usuarioSeleccionado.nombre + Date.now()
      const storageRef = firebase.storage().ref('/recursos/' + nombre)
      const task = storageRef.put(this.currentFileUpload)
      //Tarea realizandose
      task.on('state_changed', snapshot => {
        console.log('Running')
      }, error => {
        console.log(error);
        this.doingRegistro = false;
        this.mostrarMensajeIncorrectoImagen();
      }, () => {
        storageRef.getDownloadURL().then((url) => {
          this.usuarioSeleccionado.imagen = url;
          this.saveUsuario(formulario);
        }).catch((error) => {
          this.doingRegistro = false;
          this.mostrarMensajeIncorrectoImagen();
        });
      });
    } else {
      this.saveUsuario(formulario);
    }
  }
  /**
   * Mostrar mensaje error en la operacion
   */
  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }
  /**
   * Mostrar mensaje error al subir la imagen
   */
  mostrarMensajeIncorrectoImagen() {
    this.msgs = [];
    console.log("sdasdasda")
    this.msgs.push({ severity: 'error', summary: 'Error al subir la imagen' });
  }
  /**
   * Mostrar mensaje valor existente
   * @param campo Campo duplicado
   */
  mostrarMensajeDuplicado(campo: string) {
    this.msgs = [];
    console.log("sdasdasda")
    this.msgs.push({ severity: 'error', summary: 'El campo ' + campo + ' ya esta registrado' });
  }
}

