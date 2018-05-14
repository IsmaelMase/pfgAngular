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

    getReservasByRecursoAndFecha(id: string, fecha) {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token") });

        return this._http.get(this.url + 'reserva/reservasByRecursoAndfecha/' + id + "/" + fecha, { headers: headers }).map(res => res);
    }

    getReservasByUsuarioAndFecha(id: string, fecha) {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token") });

        return this._http.get(this.url + 'reserva/reservasByUsuarioAndFecha/' + id + "/" + fecha, { headers: headers }).map(res => res);
    }

    getFechasNoDisponibles(horas: string[], idRecurso: string) {
        let json = JSON.stringify(horas);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        console.log(json);
        return this._http.post(this.url + 'reserva/getFechasDisponibles/' + idRecurso, json, { headers: headers })
            .map(res => res);
    }

    addReserva(reserva: Reserva) {
        let json = JSON.stringify(reserva);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'reserva/saveReserva', json, { headers: headers })
            .map(res => res);

    }

    removeReserva(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url + 'reserva/removeReserva/' + id, { headers: headers })
            .map(res => res);

    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}