import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Usuario } from '../modelo/usuario';

import { CONSTANTS } from './serviceConstants';
{ }

@Injectable()
export class UsuarioService {

    public url: string;

    constructor(
        public _http: Http
    ) {
        this.url = CONSTANTS.url;
    }

    getUsuarios() {
        let headers = new Headers({ 'Authorization': localStorage.getItem("token")});

        return this._http.get(this.url + 'usuario/usuarios',{headers:headers}).map(res => res.json());
    }

    addUsuario(usuario: Usuario){
        let json = JSON.stringify(usuario);
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.post(this.url+'usuario/saveUsuario', json, {headers: headers})
                         .map(res => res);
                       
    }

    removeUsuario(id: String){
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Authorization', localStorage.getItem("token"));

        return this._http.delete(this.url+'usuario/removeUsuario/'+id, {headers: headers})
                         .map(res => res);
                       
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}