import { Horario } from "./horario";

export class Recurso {
    constructor(
        public id: string,
        public nombre: string,
        public datos: string,
        public incidencia: string,
        public capacidad: number,
        public tipo: string,
        public intervalo:Horario,
        public imagen:string
    ) { }
}