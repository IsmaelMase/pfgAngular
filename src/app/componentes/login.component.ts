import { Component, OnInit } from '@angular/core';
import { LoginService } from '../servicios/login.service';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: '../vista/login/login.component.html',
  styleUrls: ['../vista/login/login.component.css']
})
export class LoginComponent implements OnInit {

  public usuario: Usuario;
  public password: string;
  public msgs: Message[] = [];

  constructor(
    private _loginService: LoginService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    this.usuario = new Usuario("", "", "", "", "", "", "", [],"");
  }

  ngOnInit() {
    if (localStorage.getItem("token")) {
      this._router.navigate(["pantallaApp"]);
    }
  }

  login(event) {
    if (event.keyCode == 13 || event.type == "click") {
      this.usuario.password = btoa(this.password);
      this._loginService.login(this.usuario).subscribe(
        response => {
          console.log(response);
          if (response.status === 403) {
            this.mostrarMensajeIncorrecto();
            this.password = "";
          } else {
            
            localStorage.setItem("token", response.json().authorization);
            localStorage.setItem("usuario", JSON.stringify(response.json().usuario))
            console.log(JSON.stringify(response.json().usuario));
            this._router.navigate(["pantallaApp"]);
          }
        },
        error => {
          this.mostrarMensajeIncorrecto();
        }
      );
    }
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Usuario o contraseña incorrectos' });
  }

}
