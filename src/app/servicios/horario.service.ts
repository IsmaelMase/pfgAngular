import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { CONSTANTS } from './serviceConstants';
import { Horario } from '../modelo/horario';
{ }

@Injectable()
export class HorarioService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getHoras() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token") });

        return this._http.get(this.url + 'intervalo/intervalos', { headers: headers }).map(res => res);
    }

    addHorario(horario: Horario){
        let json = JSON.stringify(horario);
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url+'intervalo/saveIntervalo', json, {headers: headers})
                         .map(res => res);
                       
    }

    removeHorario(id: String){
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url+'intervalo/removeIntervalo/'+id, {headers: headers})
                         .map(res => res);
                       
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}