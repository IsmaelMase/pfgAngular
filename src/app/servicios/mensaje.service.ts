import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Mensaje } from '../modelo/mensaje';

import { CONSTANTS } from './serviceConstants';
{ }

@Injectable()
export class MensajeService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getMensajes(id:String) {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});

        return this._http.get(this.url + 'mensaje/mensajes/'+id,{headers:headers}).map(res => res);
    }

    addMensaje(mensaje: Mensaje){
        let json = JSON.stringify(mensaje);
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url+'mensaje/sendMensaje', json, {headers: headers})
                         .map(res => res);
                       
    }

    removeMensaje(id: String){
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url+'mensaje/removeMensaje/'+id, {headers: headers})
                         .map(res => res);
                       
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}