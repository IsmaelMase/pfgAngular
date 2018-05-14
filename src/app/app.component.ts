import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  oculto = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
  }

  ocultar(){
    this.oculto = !this.oculto;
  }

  changeOfRoutes(){
    if(localStorage.getItem("token") === undefined){
      this._router.navigate(["login"]);
    }
  }
}
