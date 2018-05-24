import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CONSTANTS } from './serviceConstants';

@Injectable()
export class UploadService {
    public url: string;

    constructor(
        private http: HttpClient) {
        this.url = CONSTANTS.url;
    }
    saveImage(file: File): Observable<HttpEvent<{}>> {
        const formdata: FormData = new FormData();

        formdata.append('file', file);

        const req = new HttpRequest('POST', this.url+'upload/saveFile', formdata, {
            reportProgress: true,
            responseType: 'text'
        });

        return this.http.request(req);
    }

    private handleError(error: any): Promise<any> {
        console.error('Some error occured', error);
        return Promise.reject(error.message || error);
    }
}