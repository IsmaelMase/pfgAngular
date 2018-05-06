import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { CONSTANTS } from './serviceConstants';
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
        return this._http.get(this.url + 'intervalo/intervalos').map(res => res.json());
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}