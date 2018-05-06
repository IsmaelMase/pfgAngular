import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CursoService } from '../servicios/curso.service';
import { UsuarioService } from '../servicios/usuario.service';
import { ReservaService } from '../servicios/reserva.service';
import { HorarioService } from '../servicios/horarios.service';
import { Recurso } from '../modelo/recurso';
import { Curso } from '../modelo/curso';
import { Usuario } from '../modelo/usuario';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Reserva } from '../modelo/reserva';

@Component({
  selector: 'reserva',
  templateUrl: '../vista/reserva/reserva.component.html',
  styleUrls: ['../vista/reserva/reserva.component.css']
})
export class ReservaComponent implements OnInit {
  @Input('dialog') dialog: string;
  @Input('recurso') recurso: Recurso;
  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();

  public usuarios: Usuario[];
  public msgs: Message[] = [];
  public cols: any[];
  public minDate = new Date();
  public maxDate = new Date();
  public es: any;
  public horasDisponibles: string[];
  public reserva: Reserva;
  public fechaSeleccionada: Date;
  public reservaDiaria: boolean = false;
  public fechaNoDisponibles: string[];


  constructor(
    private _reservaService: ReservaService,
    private _horarioService: HorarioService,
    private _usuarioService: UsuarioService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    if (this.dialog === "diaria") {
      this.reserva = new Reserva("", [], [], null, null, "");
      this.getHorasDisponibles();
      this.getUsuarios();
      this.reservaDiaria = true;
      console.log("llego");
    }
    this.reserva.recurso = this.recurso;
    this.maxDate.setFullYear(this.minDate.getFullYear() + 1);
    this.es = {
      firstDayOfWeek: 1,
      dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      today: 'Hoy',
      clear: 'Borrar'
    }
    this.cols = [
      { field: 'dni', header: 'DNI' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' }
    ];
  }

  getHorasDisponibles() {
    this._horarioService.getHoras().subscribe(
      response => {
        this.horasDisponibles = response;
        console.log(this.horasDisponibles);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getFechasNoDisponibles(){
    this._reservaService.getFechasNoDisponibles(this.reserva.intervalos_reservas,this.recurso.id).subscribe(
      response => {
        console.log(response)
      },
      error => {
        console.log(error)
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  getUsuarios() {
    this._usuarioService.getUsuarios().subscribe(
      response => {
        this.usuarios = response;
        console.log(this.usuarios);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  abrirDialogReservaDiaria(recurso: Recurso) {
    this.reserva.recurso = recurso;
    this.getHorasDisponibles();
    this.getUsuarios();
    console.log(this.horasDisponibles);
  }


  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  cancelar() {
    this.reservaDiaria = false;
    this.recurso = null;
    this.cerrar.emit("cerrar");
  }

  saveReserva() {
    console.log(this.reserva)
    this._reservaService.addReserva(this.reserva).subscribe(
      response => {
        console.log(response)
        if (response.status === 201) {
          this.cerrar.emit("ok");
        } else {
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

}
