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
  public calendario :Map<number,String[]>;
  public visible:boolean=false;
  public numeroFilas
  public mapa=new Map<number, string[]>();
  public filas:any[];

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
      dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      today: 'Hoy',
      clear: 'Borrar'
    }
    this.getRecursos();
  }

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

  getReservas() {
    this.fechasSeleccionadas.sort();
    this._reservaService.getReservasByRecursoAndFechas(this.recursoSeleccionado.id, this.fechasSeleccionadas).subscribe(
      response => {
        if (response.status !== 403) {
          this.calendario=response.json();
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

  convertirAMap(map){
    for(let filas in map){
      this.mapa.set(Number(filas),map[filas]);
    }
  }
  getKeys(map){
    console.log(map);
    this.filas=[];
    for(let filas in map){
      this.filas.push(map[filas]);
    }
    this.visible=true;
    console.log(this.filas);
    return this.filas;
  }
 
  print(){
    window.print();
  }
}
