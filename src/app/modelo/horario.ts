export class Horario{
	constructor(
		public id: string,
        public nombre: string,
		public intervalos:string[],
		public fecha_max:string[]
	){}
}