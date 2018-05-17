import { Component, OnInit } from '@angular/core';
import { MensajeService } from '../servicios/mensaje.service';
import { UsuarioService } from '../servicios/usuario.service';
import { Mensaje } from '../modelo/mensaje';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import * as moment from 'moment';
@Component({
  selector: 'app-mensaje',
  templateUrl: '../vista/mensaje/mensaje.component.html',
  styleUrls: ['../vista/mensaje/mensaje.component.css']
})
export class MensajeComponent implements OnInit {

  public usuarios: Usuario[];
  public mensajes: Mensaje[];
  public mensajeSeleccionado: Mensaje;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public cols: any[];
  public pos: number = -1;
  public usuario: Usuario;
  public visualizar: boolean = false;
  constructor(
    private _usuarioService: UsuarioService,
    private _mensajeService: MensajeService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.cols = [
      { field: 'emisor', header: 'Enviado por...' },
      { field: 'cuerpo', header: 'Cuerpo' },
      { field: 'fecha', header: 'Fecha' },
    ];
  }

  ngOnInit() {
    registerLocaleData(localeEs, 'es', localeEsExtra);
    moment.lang("es");
    this.usuario = JSON.parse(localStorage.getItem("usuario"))
    this.getMensajes();
    this.mensajeSeleccionado = new Mensaje("", this.usuario, null, "", false, "");
  }

  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe(
      response => {
        if (response.status !== 403) {
          this.usuarios = response.json();
          console.log(this.usuarios);
        } else {
          this._router.navigate(["login"]);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getMensajes() {
    this._mensajeService.getMensajes(this.usuario.id).subscribe(
      response => {
        if (response.status !== 403) {
          this.mensajes = response.json();
          this.getUsuarios();
          console.log(this.mensajes);
        } else {
          this._router.navigate(["login"]);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  filtrarUsuario(event) {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    for (let i = 0; i < this.usuarios.length; i++) {
      let usuario = this.usuarios[i];
      if (usuario.nombre.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
        filtered.push(usuario);
      }
    }
    this.usuarios = [...filtered];
  }


  seleccionarMensaje(mensaje: Mensaje) {
    this.pos = this.mensajes.indexOf(mensaje);
    for (let prop in mensaje) {
      this.mensajeSeleccionado[prop] = mensaje[prop];
    }
    if (this.pos === -1) {
      this.modificando = true;
    } else {
      if (!this.mensajeSeleccionado.leido) {
        this.mensajeSeleccionado.leido = true;
        this.saveMensaje();
      }
      this.visualizar = true;
    }
  }

  cancelar() {
    this.mensajeSeleccionado = new Mensaje("", this.usuario, null, "", false, "");
    this.modificando = false;
    this.visualizar = false;
  }

  abrirDialog() {
    this.mensajeSeleccionado = new Mensaje("", this.usuario, null, "", false, "");
    this.modificando = true;
  }

  saveMensaje() {
    if (!this.mensajeSeleccionado.id) {
      this.mensajeSeleccionado.fecha = moment().format("L");
    }
    console.log(this.mensajeSeleccionado)
    this._mensajeService.addMensaje(this.mensajeSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
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

  removeMensaje(mensaje: Mensaje) {
    this._mensajeService.removeMensaje(mensaje.id).subscribe(
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
      message: '¿Desea eliminar el mensaje?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeMensaje(this.mensajeSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    console.log(this.mensajes);
    console.log(response.json().receptor.indexOf(this.usuario));
    if (this.pos !== -1 && response.json().receptor.indexOf(this.usuario) !== -1) {
      this.mensajes[this.pos] = response.json();
    } else if (this.pos === -1 && response.json().receptor.indexOf(this.usuario) !== -1) {
      this.mensajes.push(response.json());
    }
    this.pos = -1;
    console.log(this.mensajes)
  }

  eliminarElementoArray() {
    this.mensajes.splice(this.pos, 1);
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