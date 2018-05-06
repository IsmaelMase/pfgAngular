import { Usuario } from './usuario';
import { Recurso } from './recurso';

export class Reserva {
    constructor(
        public id: string,
        public fechas_reservas: string[],
        public intervalos_reservas: string[],
        public usuario: Usuario,
        public recurso: Recurso,
        public anotacion: string
    ) { }
}