import { Component, OnInit } from '@angular/core';
import { LoginService } from '../servicios/login.service';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { UserChangePass } from '../modelo/userChangePass';

@Component({
  selector: 'app-login',
  templateUrl: '../vista/login/login.component.html',
  styleUrls: ['../vista/login/login.component.css']
})
export class LoginComponent implements OnInit {

  public usuario: Usuario;
  public password: string;
  public msgs: Message[] = [];
  public changePass: boolean = false;
  public userChangePass: UserChangePass;
  constructor(
    private _loginService: LoginService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    this.usuario = new Usuario("", "", "", "", "", "", "", [], "", "");
    this.userChangePass = new UserChangePass("", "","");
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

  sendRequest() {
    let password = this.generatePass();
    this.userChangePass.passEncr = btoa(password);
    this.userChangePass.pass = password;
    this._loginService.changePassword(this.userChangePass).subscribe(
      response => {
        console.log(response);
        if (response.status === 404) {
          this.usuarioNotFound();
        } else if (response.status === 400) {
          this.operationNotDone();
        } else if (response.status === 200) {
          this.cancelar();
          this.operationDone();
        }
      },
      error => {
        this.operationNotDone();
      }
    );
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Usuario o contraseña incorrectos' });
  }

  usuarioNotFound() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'El email introducido no esta regristrado' });
  }
  operationNotDone() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }
  operationDone() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Contraseña modificada', detail: 'Contraseña enviada al email' });
  }

  openDialog() {
    this.changePass = true;
  }

  cancelar() {
    this.userChangePass = new UserChangePass("", "","");
    this.changePass = false;
  }

  generatePass() {
    var chars = "ABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < 8; x++) {
      var i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
    }
    return pass;
  }

}
