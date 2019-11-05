import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { AvisocamposComponent } from '../avisocampos/avisocampos.component';
import { LogadoService } from '../services/logado/logado.service';
import { AvisocamposService } from '../services/avisocampos/avisocampos.service';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dados',
  templateUrl: './dados.component.html',
  styleUrls: ['./dados.component.scss']
})

export class DadosComponent implements OnInit, OnDestroy {
  nome: string;
  usuario: string;
  link: string;



  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private serviceCampos: AvisocamposService,
    private logado: LogadoService,
  ) { }


  ngOnInit() {
  }

  ngOnDestroy(): void {

  }

}
