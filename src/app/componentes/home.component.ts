import { Component, OnInit } from '@angular/core';
import { Usuario } from '../modelo/usuario';

@Component({
  selector: 'app-home',
  templateUrl: '../vista/home/home.component.html',
  styleUrls: ['../vista/home/home.component.css']
})
export class HomeComponent implements OnInit {

  public usuario :Usuario
  constructor() { 
    this.usuario = JSON.parse(localStorage.getItem("usuario"))
  }

  ngOnInit() {
  }

}
