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
    this.usuario = new Usuario("", "", "", "", "", "", "", [], "", "", true);
    this.userChangePass = new UserChangePass("", "", "");
  }

  ngOnInit() {
    if (localStorage.getItem("token")) {
      if (JSON.parse(localStorage.getItem("usuario")).rol === "ROL_PROFESOR") {
        this._router.navigate(["pantallaApp"]);
      } else {
        this._router.navigate(["pantallaApp"]);
      }
    }
  }
  /**
   * Metodo para loguearse en la aplicacion
   * @param event Evento cuando pulsa enter o click
   */
  login(event) {
    if (event.keyCode == 13 || event.type == "click") {
      //se encripta la contraseña
      this.usuario.password = btoa(this.password);
      this._loginService.login(this.usuario).subscribe(
        response => {
          if (response.status === 403) {
            this.mostrarMensajeIncorrecto();
            this.password = "";
          } else {
            //se recarga la pagina y se guardan datos en cache
            window.location.reload();
            localStorage.setItem("token", response.json().authorization);
            localStorage.setItem("usuario", JSON.stringify(response.json().usuario))
            setTimeout(() => {
              if (response.json().usuario.rol === "ROL_PROFESOR") {
                this._router.navigate(["pantallaApp"]);
              } else {
                this._router.navigate(["pantallaApp"]);
              }
            }, 2000);
          }
        },
        error => {
          this.mostrarMensajeIncorrecto();
        }
      );
    }
  }
  /**
   * Metodo para generar nueva contraseña y envir peticion para cambiarla
   */
  sendRequest() {
    let password = this.generatePass();
    this.userChangePass.passEncr = btoa(password);
    this.userChangePass.pass = password;
    this._loginService.changePassword(this.userChangePass).subscribe(
      response => {
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
        if (error.status === 404) {
          this.usuarioNotFound();
        } else if (error.status === 400) {
          this.operationNotDone();
        } else {
          this.operationNotDone();
        }
      }
    );
  }
  /**
   * Mostrar mensaje erro en la aplicacion
   */
  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Usuario o contraseña incorrectos' });
  }
  /**
   * Mostrar mensaje usuario no encontrado
   */
  usuarioNotFound() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'El email introducido no esta regristrado' });
  }
  /**
   * Cambio de contraseña no se ha podido realizar
   */
  operationNotDone() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }
  /**
   * Cambio de contrañesa realizado
   */
  operationDone() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Contraseña modificada', detail: 'Contraseña enviada al email' });
  }
  /**
   * Abrir dialog cambio de contraseña
   */
  openDialog() {
    this.changePass = true;
  }
  /**
   * Cerrar dialog cambio de contraseña
   */
  cancelar() {
    this.userChangePass = new UserChangePass("", "", "");
    this.changePass = false;
  }
  /**
   * Generar contraseñas aleatoria
   */
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
