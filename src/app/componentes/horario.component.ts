import { Component, OnInit, NgZone } from '@angular/core';
import { HorarioService } from '../servicios/horario.service';
import { Horario } from '../modelo/horario';
import { Intervalo } from '../modelo/intervalo';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'horario',
  templateUrl: '../vista/horario/horario.component.html',
  styleUrls: ['../vista/horario/horario.component.css']
})
export class HorarioComponent implements OnInit {

  public minDate = new Date();
  public selectedDate: Date;
  public horarios: Horario[] = [];
  public intervalo: Intervalo;
  public intervalos: Intervalo[];
  public horarioSeleccionado: Horario;
  public modificando: boolean = false;
  public msgs: Message[] = [];
  public pos: number = -1;
  public es: any;
  constructor(
    private _horarioService: HorarioService,
    private _route: ActivatedRoute,
    private _router: Router,
    private confirmationService: ConfirmationService,
    private zone: NgZone
  ) {

  }

  ngOnInit() {
    this.getHorarios();
    this.horarioSeleccionado = new Horario("", "", [], null);
    this.intervalo = new Intervalo("", "", false);
    this.intervalos = [];
    this.es = {
      firstDayOfWeek: 1,
      dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      today: 'Hoy',
      clear: 'Borrar'
    }
  }

  addIntervalo() {
    this.intervalos.push(this.intervalo);
    this.intervalos = [...this.intervalos];
    this.intervalo = new Intervalo("", "", false);
  }
  removeIntervalo(intervalo) {
    console.log(intervalo);
    let pos = this.intervalos.indexOf(intervalo);
    this.intervalos.splice(pos, 1);
    this.intervalos = [...this.intervalos];
  }

  comprobar(value: string, campo: string) {
    if (campo === "inicio") {
      this.intervalo.inicio = value;
    } else {
      this.intervalo.fin = value;
    }
    if (this.intervalo.inicio !== "" && this.intervalo.fin !== "") {
      if (this.intervalo.inicio >= this.intervalo.fin) {
        this.intervalo.valido = false;
      } else {
        let intervalos = this.intervalos.filter(intervalo => intervalo.inicio === this.intervalo.inicio && intervalo.fin === this.intervalo.fin);
        if (intervalos.length == 0) {
          this.intervalo.valido = true;
        } else {
          this.intervalo.valido = false;
        }
      }
    } else {
      this.intervalo.valido = false;
    }
  }


  getHorarios() {
    this._horarioService.getHoras().subscribe(
      response => {
        if (response.status !== 403) {
          this.horarios = response.json();
        } else {
          localStorage.clear();
          this._router.navigate(["login"]);
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  seleccionarHorario(horario: Horario) {
    this.pos = this.horarios.indexOf(horario);
    for (let prop in horario) {
      this.horarioSeleccionado[prop] = horario[prop];
    }
    if (this.horarioSeleccionado.intervalos) {
      for (let intervalo of this.horarioSeleccionado.intervalos) {
        let intervaloSeparado = intervalo.split("-");
        this.intervalos.push(new Intervalo(intervaloSeparado[0], intervaloSeparado[1], true));
      }
    }
    console.log(this.horarioSeleccionado.fecha_max)
    this.selectedDate = new Date(this.horarioSeleccionado.fecha_max);
    console.log(this.selectedDate);
    this.modificando = true;
  }

  cancelar() {
    this.intervalos = [];
    this.modificando = false;
    this.selectedDate = null;
    this.horarioSeleccionado = new Horario("", "", [], null);
    this.intervalo = new Intervalo("", "", false);
  }

  abrirDialog() {
    this.horarioSeleccionado = new Horario("", "", [], null);
    this.modificando = true;
  }

  seleccionarFecha(value: Date) {
    this.horarioSeleccionado.fecha_max = value.toDateString();
  }

  saveHorario() {
    this.intervalos.sort();
    this.horarioSeleccionado.intervalos = [];
    for (let intervalo of this.intervalos) {
      console.log(intervalo);
      this.horarioSeleccionado.intervalos.push(intervalo.inicio + "-" + intervalo.fin);
    }
    console.log(this.horarioSeleccionado)
    this._horarioService.addHorario(this.horarioSeleccionado).subscribe(
      response => {
        console.log(response);
        if (response.status === 201) {
          this.intervalos = [];
          this.selectedDate = null;
          this.mostrarMensajeCorrecto();
          this.remplazarObjeto(response);
          this.cancelar();
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else {
          this.mostrarMensajeIncorrecto();
        }
      },
      error => {
        this.mostrarMensajeIncorrecto();
      }
    );
  }

  removeHorario(horario: Horario) {
    this._horarioService.removeHorario(horario.id).subscribe(
      response => {
        console.log(response);
        if (response.status === 200) {
          this.mostrarMensajeCorrecto();
          this.eliminarElementoArray(horario);
          this.cancelar();
        } else if (response.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else if (response.status === 409) {
          this.mostrarMensajeNoPuedeBorrar();
          this.cancelar();
        } else {
          this.mostrarMensajeIncorrecto();
          this.cancelar();
        }
      },
      error => {
        if (error.status === 403) {
          localStorage.clear();
          this._router.navigate(["login"]);
        } else if (error.status === 409) {
          this.mostrarMensajeNoPuedeBorrar();
          this.cancelar();
        } else {
          this.mostrarMensajeIncorrecto();
          this.cancelar();
        }
      }
    );
  }

  confirmacionBorrado(horario: Horario) {
    this.confirmationService.confirm({
      message: '¿Desea elminiar el horario?',
      header: 'Confirmacion eliminado',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeHorario(this.horarioSeleccionado);
      },
      reject: () => {
      }
    });
  }

  remplazarObjeto(response) {
    let horario = this.horarios.filter((h: Horario) => h.id === response.json().id);
    if (horario.length > 0) {
      this.horarios[this.pos] = response.json();
    } else {
      this.horarios.push(response.json());
    }
    this.pos = -1;
    this.horarios=[...this.horarios];
  }

  eliminarElementoArray(horario: Horario) {
    this.horarios.splice(this.pos, 1);
  }


  mostrarMensajeCorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'success', summary: 'Operacion realizada' });
  }

  mostrarMensajeIncorrecto() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', summary: 'Error en la operación' });
  }

  mostrarMensajeNoPuedeBorrar() {
    this.msgs = [];
    this.msgs.push({ severity: 'error', detail: 'El horario no puede ser borrado porque esta asignado a un horario', summary: 'Eliminación cancelada' });
  }

}
