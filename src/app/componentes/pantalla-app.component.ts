import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-pantalla-app',
  templateUrl: '../vista/pantallaApp/pantalla-app.component.html',
  styleUrls: ['../vista/pantallaApp/pantalla-app.component.css']
})
export class PantallaAppComponent implements OnInit {
  oculto = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
  }

  ocultar() {
    this.oculto = !this.oculto;
  }
}
