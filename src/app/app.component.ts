import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';

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
    var app = firebase.initializeApp({
      apiKey: "AIzaSyC8Cxez8isntpZLmbhy7QxJ4FO9qk-TrLI",
      authDomain: "salerevfotos.firebaseapp.com",
      databaseURL: "https://salerevfotos.firebaseio.com",
      projectId: "salerevfotos",
      storageBucket: "salerevfotos.appspot.com",
      messagingSenderId: "311606484205"
    })
  }

  ocultar() {
    this.oculto = !this.oculto;
  }

  changeOfRoutes() {
    if (localStorage.getItem("token") === undefined) {
      this._router.navigate(["login"]);
    }
  }
}
