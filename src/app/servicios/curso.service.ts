import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Curso } from '../modelo/curso';

import { CONSTANTS } from './serviceConstants';
{ }

@Injectable()
export class CursoService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getCursos() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});
        return this._http.get(this.url + 'curso/cursos', { headers: headers }).map(res => res);
    }

    addCurso(curso: Curso) {
        let json = JSON.stringify(curso);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url + 'curso/saveCurso', json, { headers: headers })
            .map(res => res);

    }

    removeCurso(id: String) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url + 'curso/removeCurso/' + id, { headers: headers })
            .map(res => res);

    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}