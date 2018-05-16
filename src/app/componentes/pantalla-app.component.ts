import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Usuario } from "../modelo/usuario";
import { Message } from 'primeng/api';

@Component({
  selector: 'app-pantalla-app',
  templateUrl: '../vista/pantallaApp/pantalla-app.component.html',
  styleUrls: ['../vista/pantallaApp/pantalla-app.component.css']
})
export class PantallaAppComponent implements OnInit {
  oculto = false;
  public usuario: Usuario;
  public msgs: Message[] = [];
  public cambiarConfig:boolean=false;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.cambiarConfig=false;
    this.usuario = JSON.parse(localStorage.getItem("usuario"))
  }

  ocultar() {
    this.oculto = !this.oculto;
  }

  changeOfRoutes() {
    if (localStorage.getItem("token") === undefined || localStorage.getItem("token") === null) {
      this._router.navigate(["login"]);
    }
  }

  logout() {
    localStorage.clear();
    this._router.navigate(["login"]);
  }

  abrirDialogConfiguracion(){
    this.cambiarConfig=true;
  }

  cerrarDialogReservas(e) {
    if (e === "ok") {
      this.cambiarConfig=false;
      this.usuario = JSON.parse(localStorage.getItem("usuario"))
      this.mostrarMensajeCorrecto();
    } else if (e === "fail") {
      this.cambiarConfig=false;
      this.mostrarMensajeIncorrecto();
    }else{
      this.cambiarConfig=false;
    }
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
