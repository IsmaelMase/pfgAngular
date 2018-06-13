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
import { CONSTANTS } from '../servicios/serviceConstants';
import * as firebase from 'firebase';


@Component({
  selector: 'usuario',
  templateUrl: '../vista/usuario/usuario.component.html',
  styleUrls: ['../vista/usuario/usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public url = CONSTANTS.url;
  public usuarios: Usuario[];
  public usuariosTotales: Usuario[];
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
  public loading: boolean;
  public doingRegistro: boolean;
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
      { field: 'apellido', header: 'Apellidos' },
      { field: 'email', header: 'Email' }
    ];
    this.colsCursos = [
      { field: 'nombre', header: 'Nombre' }
    ];
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
  }

  ngOnInit() {
    if (JSON.parse(localStorage.getItem("usuario")).rol === "ROL_PROFESOR") {
      this._router.navigate(["pantallaApp/inicio"]);
    }
    this.password = "";
    this.getUsuarios();
    this.loading = true;
    this.doingRegistro = false;
  }

  /**
   * Obtener usuarios
   */
  getUsuarios() {
    this.loading = true;
    this._usuarioService.getUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
          this.usuariosTotales = response.json();
          this.loading = false;
          this.getCursos();
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
   * Seleccionar un usuario
   * @param usuario Usuario
   */
  seleccionarUsuario(usuario: Usuario) {
    this.pos = this.usuarios.indexOf(usuario);
    for (let prop in usuario) {
      this.usuarioSeleccionado[prop] = usuario[prop];
    }
    this.modificando = true;
    console.log(this.usuarioSeleccionado.cursos);
  }
  /**
   * Cerrar dialog de modificacion/creacion de un usuario
   */
  cancelar() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = false;
    this.password = "";
    this.doingRegistro = false;
  }
  /**
   * Abrir dialog de modificacion/creacion de un usuario
   */
  abrirDialog() {
    this.usuarioSeleccionado = new Usuario("", "", "", "", "", "", "", [], "ROL_PROFESOR", "", true);
    this.modificando = true;
  }
  /**
   * Guardar usuario
   * @param formulario ngForm
   */
  saveUsuario(formulario) {
    if (this.password !== "") {
      this.usuarioSeleccionado.password = btoa(this.password);
    }
    this.selectedFiles = undefined;
    console.log(this.usuarioSeleccionado.password);
    this._usuarioService.addUsuario(this.usuarioSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.reemplazarObjeto(response);
          this.cancelar();
          formulario.reset();
          this.currentFileUpload = null;
          this.selectedFiles = undefined;
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
   * Inicializar imagen del usuario a una por defecto
   */
  resetImage() {
    this.usuarioSeleccionado.imagen = "";
    this.currentFileUpload = null;
    this.selectedFiles = undefined;
  }
  /**
   * Seleccionar imagen
   * @param event Evento
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
      const storageRef = firebase.storage().ref('/usuarios/' + nombre)
      const task = storageRef.put(this.currentFileUpload)
      //Tarea realizandose
      task.on('state_changed', snapshot => {
        console.log('Running')
      }, error => {
        console.log(error);
        this.mostrarMensajeIncorrectoImagen();
        this.doingRegistro = false;
      }, () => {
        storageRef.getDownloadURL().then((url) => {
          this.usuarioSeleccionado.imagen = url;
          this.saveUsuario(formulario);
        }).catch((error) => {
          this.mostrarMensajeIncorrectoImagen();
          this.doingRegistro = false;
        });
      });
    } else {
      this.saveUsuario(formulario);
    }
  }

  /**
   * Dar de baja a un usuario
   * @param usuario Usuario
   */
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
  /**
   * Confirmacion dar de baja a un usuario
   */
  confirmacionBorrado() {
    this.confirmationService.confirm({
      message: '¿Desea dar de baja al usuario?',
      header: 'Confirmacion baja',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeUsuario(this.usuarioSeleccionado);
      },
      reject: () => {
      }
    });
  }
  /**
   * Reemplazar objecto en el array cuando se modifica
   * @param response Response
   */
  reemplazarObjeto(response) {
    let usuario = this.usuarios.filter((u: Usuario) => u.id === response.json().id);
    if (usuario.length > 0) {
      this.usuarios[this.pos] = response.json();
    } else {
      this.usuarios.push(response.json());
    }
    this.pos = -1;
    this.usuarios = [...this.usuarios];
    console.log(this.usuarios)
  }
  /**
   * Eliminar usuario del array
   */
  eliminarElementoArray() {
    this.usuarios.splice(this.pos, 1);
    this.usuarios = [...this.usuarios];
  }

  /**
   * Mostrar mensaje operacion correcto
   */
  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
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
   * Filtar array por atributos
   * @param campo String campo
   * @param value String valor
   */
  filter(campo, value) {
    if (campo === 'dni') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.dni.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'email') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.email.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'nombre') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.nombre.toUpperCase().includes(value.toUpperCase()));
    } else if (campo === 'apellido') {
      this.usuarios = this.usuariosTotales.filter(
        (usuario: Usuario) => usuario.apellido.toUpperCase().includes(value.toUpperCase()));
    }

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
