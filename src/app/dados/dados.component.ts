import { Component, OnInit, OnDestroy } from '@angular/core';

export interface User {
  matricula: string;
}

@Component({
  selector: 'app-dados',
  templateUrl: './dados.component.html',
  styleUrls: ['./dados.component.scss']
})

export class DadosComponent implements OnInit {

  ngOnInit(): void {}


}
