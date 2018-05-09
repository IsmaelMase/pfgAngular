import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Reserva } from '../modelo/reserva';

import { CONSTANTS } from './serviceConstants';
{ }

@Injectable()
export class ReservaService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getReservasByRecursoAndMes(id: string,mes) {
        return this._http.get(this.url + 'reserva/reservasByRecursoAndMes/' + id+"/"+mes).map(res => res.json());
    }

    getFechasNoDisponibles(horas: string[], idRecurso: string) {
        let json = JSON.stringify(horas);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        console.log(json);
        return this._http.post(this.url + 'reserva/getFechasDisponibles/' + idRecurso, json, { headers: headers })
            .map(res => res.json());
    }

    addReserva(reserva: Reserva) {
        let json = JSON.stringify(reserva);
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this._http.post(this.url + 'reserva/saveReserva', json, { headers: headers })
            .map(res => res);

    }

    removeReserva(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this._http.delete(this.url + 'reserva/removeReserva/' + id, { headers: headers })
            .map(res => res);

    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}