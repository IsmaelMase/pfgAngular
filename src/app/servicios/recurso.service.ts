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
        return this._http.get(this.url + 'recurso/otros').map(res => res.json());
    }

    getAulas() {
        return this._http.get(this.url + 'recurso/aulas').map(res => res.json());
    }

    getRecursos() {
        return this._http.get(this.url + 'recurso/allRecursos').map(res => res.json());
    }

    addRecurso(recurso: Recurso) {
        let json = JSON.stringify(recurso);
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this._http.post(this.url + 'recurso/saveRecurso', json, { headers: headers })
            .map(res => res);

    }

    removeRecurso(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.delete(this.url + 'recurso/removeRecurso/' + id, { headers: headers })
            .map(res => res);

    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}