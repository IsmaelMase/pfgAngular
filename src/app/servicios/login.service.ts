import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { CONSTANTS } from './serviceConstants';

@Injectable()
export class LoginService {

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
     * Metodo envia peticion de login
     * @param usuarioLogin Datos de usuario
     */
    login(usuarioLogin: any) {
        let json = JSON.stringify(usuarioLogin);
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this._http.post(this.url + 'login', json, { headers: headers })
            .map((res: Response) => res);

    }
    /**
     * Peticion cambio de contraseña
     * @param changePassUser Datos usuario
     */
    changePassword(changePassUser: any) {
        let json = JSON.stringify(changePassUser);
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this._http.post(this.url + 'mail/sendMail', json, { headers: headers })
            .map((res: Response) => res);

    }


    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}