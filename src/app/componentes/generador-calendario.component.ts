import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReservaService } from '../servicios/reserva.service';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Reserva } from '../modelo/reserva';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import * as moment from 'moment';
import { RecursoService } from '../servicios/recurso.service';
import { Recurso } from '../modelo/recurso';

@Component({
  selector: 'generador-calendario',
  templateUrl: '../vista/generador-calendario/generador-calendario.component.html',
  styleUrls: ['../vista/generador-calendario/generador-calendario.component.css']
})
export class GeneradorCalendarioComponent implements OnInit {

  public minDate = new Date();
  public maxDate = new Date();
  public es: any;
  public fechasSeleccionadas: string[];
  public eventos: any[] = [];
  public recursos: Recurso[];
  public recursoSeleccionado: Recurso;
  public calendario: Map<number, String[]>;
  public visible: boolean = false;
  public numeroFilas
  public mapa = new Map<number, string[]>();
  public filas: any[];

  constructor(
    private _reservaService: ReservaService,
    private _recursoService: RecursoService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.maxDate.setFullYear(this.minDate.getFullYear() + 1);
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
    this.getRecursos();
  }
  /**
   * Obtener recursos
   */
  getRecursos() {
    this._recursoService.getRecursos().subscribe(
      response => {
        if (response.status !== 403) {
          console.log(response.json());
          this.recursos = response.json();
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
  /**
   * Obtener reservas
   */
  getReservas() {
    this.fechasSeleccionadas.sort();
    this._reservaService.getReservasByRecursoAndFechas(this.recursoSeleccionado.id, this.fechasSeleccionadas).subscribe(
      response => {
        if (response.status !== 403) {
          this.calendario = response.json();
          this.getKeys(this.calendario);
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
  /**
   * Convertir respuesta a map
   * @param map Map
   */
  convertirAMap(map) {
    for (let filas in map) {
      this.mapa.set(Number(filas), map[filas]);
    }
  }

  /**
   * Obtener claves Map
   * @param map Map
   */
  getKeys(map) {
    console.log(map);
    this.filas = [];
    for (let filas in map) {
      this.filas.push(map[filas]);
    }
    this.visible = true;
    console.log(this.filas);
    return this.filas;
  }
  /**
   * Imprimir pantalla
   */
  print() {
    window.print();
  }
}
