import { Curso } from './curso';

export class Usuario {
    constructor(
        public id: string,
        public dni: string,
        public nombre: string,
        public apellido: string,
        public telefono: string,
        public email: string,
        public password: string,
        public cursos: Curso[],
        public rol: string,
        public imagen:string
    ) { }
}