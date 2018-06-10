import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nombre' })

export class Nombre implements PipeTransform {
  transform(nombre: string): string {
    //se separa la cadena por espacios
    let nombreDividido = nombre.split(" ");
    let nombreFinal = "";
    //se recorren los caracteres
    for (var n of nombreDividido) {
      //se cambia el primer caracter a mayuscula
      n = n.toLowerCase();
      n = n.charAt(0).toUpperCase()+n.slice(1);
      let pos= n.indexOf("-");
      n=n.replace("-"+n.charAt(pos+1),"-"+n.charAt(pos+1).toUpperCase());
      nombreFinal += n+' ';
    }
    return nombreFinal;
  }
}
