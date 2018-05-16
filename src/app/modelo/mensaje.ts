import { Usuario } from './usuario';

export class Mensaje {
    constructor(
        public id: string,
        public emisor: Usuario,
        public receptor: Usuario[],
        public cuerpo: string,
        public leido: boolean,
        public fecha: string
    ) { }
}