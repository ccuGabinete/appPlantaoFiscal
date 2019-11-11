import { MatsnackbarService } from './../services/matsnackbar/matsnackbar.service';
import { Observable, Subscription } from 'rxjs';
import { LoginService } from './../services/acesso/login.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { LogadoService } from '../services/logado/logado.service';
import { first } from 'rxjs/operators';
import { Usuario } from '../models/usuario/usuario';
import { AvisocamposComponent } from '../avisocampos/avisocampos.component';
import { AvisocamposService } from '../services/avisocampos/avisocampos.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [LoginService]
})

export class HomeComponent implements OnInit {

  headers: string[];
  nome: string;
  link: string;

  constructor(
    private router: Router,
    public usuario: Usuario,
    public login: LoginService,
    private matsnackbarService: MatsnackbarService,
    private logado: LogadoService,
    private serviceCampos: AvisocamposService
  ) { }

  observer: Subscription;
  durationInSeconds = 225;

  @ViewChild('submitButton', { static: true }) submitButton;

  openSnackBar() {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.verticalPosition = 'top';
  }

  ngOnInit(): void {
    this.usuario.login = '';
    this.usuario.senha = '';
  }

  changeEvent($event) {
    this.submitButton.focus();
  }


  onSubmit() {
    if (!this.usuario.login || !this.usuario.senha) {
      this.openSnackBar();
    } else {

      this.login.getUser(this.usuario)
        .subscribe(res => {
          const user = new Usuario();
          if (res.body.isValid) {
            if (res.body.setor === 'plantão' || res.body.setor === 'gabinete' || res.body.setor === 'admin') {
              user.nome = res.body.nome;
              user.link = res.body.link;
              this.logado.mudarUsuario(user);
              this.router.navigateByUrl('dados');
            } else {
              this.serviceCampos.mudarAviso(5);
              this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
            }
          } else {
            this.serviceCampos.mudarAviso(5);
            this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
          }

        },

          error => {
            this.serviceCampos.mudarAviso(4);
            this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
          }

        );

    }
  }
}
