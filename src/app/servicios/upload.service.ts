import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { CONSTANTS } from './serviceConstants';

@Injectable()
export class UploadService {
    public url: string;
    /**
     * Contructor parametrizado
     * @param _http Http
     */
    constructor(
        private _http: Http) {
        this.url = CONSTANTS.url;
    }

    /**
     * Guardar imagen
     * @param file Imagen
     */
    saveImage(file: File) {
        let formdata: FormData = new FormData();

        formdata.append('file', file);

        return this._http.post(this.url + 'upload/saveFile', formdata)
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}