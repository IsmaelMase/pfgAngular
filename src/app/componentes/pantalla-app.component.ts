import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Usuario } from "../modelo/usuario";
import { Message } from 'primeng/api';
import { CONSTANTS } from '../servicios/serviceConstants';

@Component({
  selector: 'app-pantalla-app',
  templateUrl: '../vista/pantallaApp/pantalla-app.component.html',
  styleUrls: ['../vista/pantallaApp/pantalla-app.component.css']
})
export class PantallaAppComponent implements OnInit {
  public url = CONSTANTS.url;
  public oculto: boolean;
  public usuario: Usuario;
  public msgs: Message[] = [];
  public cambiarConfig: boolean = false;
  public sitioActual: string;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.cambiarConfig = false;
    this.oculto = false;
    this.usuario = JSON.parse(localStorage.getItem("usuario"))
  }
  /**
   * Metodo para comprobar si hay token guardado
   */
  changeOfRoutes() {
    if (localStorage.getItem("token") === undefined || localStorage.getItem("token") === null) {
      this._router.navigate(["login"]);
    }
  }
  /**
   * Cerrar sesion
   */
  logout() {
    localStorage.clear();
    this._router.navigate(["login"]);
  }
  /**
   * Abrir dialog cambiar datos del usuario
   */
  abrirDialogConfiguracion() {
    this.cambiarConfig = true;
  }
  /**
   * Cerrar dialog reservas
   * @param e Event 
   */
  cerrarDialogReservas(e) {
    console.log(e);
    if (e === "ok") {
      this.cambiarConfig = false;
      this.usuario = JSON.parse(localStorage.getItem("usuario"))
      this.mostrarMensajeCorrecto();
    } else if (e === "fail") {
      this.cambiarConfig = false;
      this.mostrarMensajeIncorrecto();
    } else {
      this.cambiarConfig = false;
    }
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

  cambiarRuta(ruta) {
    this.sitioActual = ruta;
  }
}
