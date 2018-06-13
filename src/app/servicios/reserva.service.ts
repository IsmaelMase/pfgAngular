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
    /**
     * Contructor parametrizado
     * @param _http Http
     */
    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }
    /**
     * Devuelve reservas por recurso y fecha
     * @param id String id recurso
     * @param fecha String fecha
     */
    getReservasByRecursoAndFecha(id: string, fecha) {
        let json = JSON.stringify(fecha);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));
        return this._http.post(this.url + 'reserva/reservasByRecursoAndFecha/' + id, json, { headers: headers }).map(res => res);
    }

    /**
     * Devuelve reservas por usuario y fecha
     * @param id String id usuario
     * @param fecha  String fecha
     */
    getReservasByUsuarioAndFecha(id: string, fecha) {
        let json = JSON.stringify(fecha);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));
        return this._http.post(this.url + 'reserva/reservasByUsuarioAndFecha/' + id, json, { headers: headers }).map(res => res);
    }
    /**
     * Devuelve reservas por recurso y fechas
     * @param id String recurso
     * @param fechas String[] fechas
     */
    getReservasByRecursoAndFechas(id: string, fechas: string[]) {
        let json = JSON.stringify(fechas);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'reserva/generarTabla/' + id, json, { headers: headers }).map(res => res);
    }
    /**
     * Devuelve fechas no disponibles para un recurso y una serie de horas
     * @param horas String[] horas
     * @param idRecurso String id recurso
     */
    getFechasNoDisponibles(horas: string[], idRecurso: string) {
        let json = JSON.stringify(horas);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'reserva/getFechasDisponibles/' + idRecurso, json, { headers: headers })
            .map(res => res);
    }
    /**
     * Guardar reservas
     * @param reserva Reserva
     */
    addReserva(reserva: Reserva) {
        let json = JSON.stringify(reserva);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'reserva/saveReserva', json, { headers: headers })
            .map(res => res);

    }
    /**
     * Borrar reserva
     * @param id String id reserva
     */
    removeReserva(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url + 'reserva/removeReserva/' + id, { headers: headers })
            .map(res => res);

    }
    /**
     * Borrar reservas
     * @param id String[] id reserva
     */
    removeReservaMass(ids: string[]) {
        let json = JSON.stringify(ids);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'reserva/removeReservasMass', json, { headers: headers }).map(res => res);
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}