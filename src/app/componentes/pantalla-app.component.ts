import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Usuario } from "../modelo/usuario";
@Component({
  selector: 'app-pantalla-app',
  templateUrl: '../vista/pantallaApp/pantalla-app.component.html',
  styleUrls: ['../vista/pantallaApp/pantalla-app.component.css']
})
export class PantallaAppComponent implements OnInit {
  oculto = false;
  public usuario: Usuario;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
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
}
