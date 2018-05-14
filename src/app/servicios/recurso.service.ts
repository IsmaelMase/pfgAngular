import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Recurso } from '../modelo/recurso';
import { CONSTANTS } from './serviceConstants';
{ }

@Injectable()
export class RecursoService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getOtros() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});

        return this._http.get(this.url + 'recurso/otros', { headers: headers }).map(res => res.json());
    }

    getAulas() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});

        return this._http.get(this.url + 'recurso/aulas', { headers: headers }).map(res => res.json());
    }

    getRecursos() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});

        return this._http.get(this.url + 'recurso/allRecursos', { headers: headers }).map(res => res.json());
    }

    addRecurso(recurso: Recurso) {
        let json = JSON.stringify(recurso);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'recurso/saveRecurso', json, { headers: headers })
            .map(res => res);

    }

    removeRecurso(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url + 'recurso/removeRecurso/' + id, { headers: headers })
            .map(res => res);

    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}