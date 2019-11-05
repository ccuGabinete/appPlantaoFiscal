import { Bairro } from './../models/bairro/bairro';
import { GeocodeService } from './../services/geocode/geocode.service';
import { Ibairro } from './../interfaces/ibairro/ibairro';
import { FormatacoesService } from './../services/formatacoes/formatacoes.service';
import { Agente } from './../models/agente/agente';
import { Auto } from './../models/auto/auto';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { LogadoService } from '../services/logado/logado.service';
import { AvisocamposService } from '../services/avisocampos/avisocampos.service';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario/usuario';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Agentes } from '../interfaces/agentes/agentes';
import { BuscalacreService } from '../services/buscarlacre/buscarlacre.service';
const go = console.log;

export interface User {
  matricula: string;
}

@Component({
  selector: 'app-dados',
  templateUrl: './dados.component.html',
  styleUrls: ['./dados.component.scss']
})

export class DadosComponent implements OnInit, OnDestroy {
  nome: string;
  usuario: string;
  link: string;
  logradouro = '';
  myControl = new FormControl();
  myControlBairros = new FormControl();
  googleoptions = {
    types: ['geocode'],
    componentRestrictions: { country: 'BR' },
    location: [-22.921712, -43.449187]
  };

  constructor(
    public autodeapreensao: Auto,
    public agente: Agente,
    public bairro: Bairro,
    private geocodeservice: GeocodeService,
    private router: Router,
    private logado: LogadoService,
    private formatacoes: FormatacoesService,
    private buscarLacre: BuscalacreService
  ) { }

  options: Agentes[] = this.agente.getLista();
  filteredOptions: Observable<Agentes[]>;
  optionsBairros: Ibairro[] = this.bairro.getListaBairro();
  filteredOptionsBairros: Observable<Ibairro[]>;

  onLogout() {
    const userLogout = new Usuario();
    userLogout.nome = '';
    userLogout.link = '';
    userLogout.senha = '';
    userLogout.isValid = false;
    userLogout.login = '';
    this.logado.mudarUsuario(userLogout);
    this.router.navigateByUrl('');
  }


  ngOnInit() {
    this.autodeapreensao = new Auto();
    this.logado.currentMessage.subscribe(user => {
      this.usuario = user.nome;
      (user.link) ? this.link = user.link.replace('open', 'uc') : this.link = '';
      this.autodeapreensao.agenterespcadastro = user.nome;

      this.filteredOptionsBairros = this.myControlBairros.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.bairro),
          map(bairro => bairro ? this._filterBairro(bairro) : this.optionsBairros.slice())
        );
    });

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.matricula),
        map(matricula => matricula ? this._filter(matricula) : this.options.slice())
      );


    // busquei todos os lacres e criei um array para armazenar esses lacres até o fim
    // da seção
    this.buscarLacre.buscarLacre().subscribe(arr => {
      const resp = this.buscarLacre.converteParaArrayDeLacres(arr.body);
      this.buscarLacre.atualizarArrayLacres(resp);
      go(resp);
    });

  }

  displayFn(agentes?: Agentes): string | undefined {
    return agentes ? agentes.matricula : undefined;
  }

  displayFnBairros(ibairro?: Ibairro): string | undefined {
    return ibairro ? ibairro.bairro : undefined;
  }

  private _filter(matricula: string): Agentes[] {
    const filterValue = matricula.toLowerCase();

    return this.options.filter(option => option.matricula.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterBairro(bairro: string): Ibairro[] {
    const filterValue = bairro.toLowerCase();

    return this.optionsBairros.filter(option => option.bairro.toLowerCase().indexOf(filterValue) === 0);
  }


  onChangeMatricula(value: any) {
    this.autodeapreensao.matricula = value.matricula;
    this.autodeapreensao.agente = value.nome;
  }

  onChangeBairro(value: any) {
    this.autodeapreensao.bairro = value.bairro;
    this.autodeapreensao.ra = value.RA;
    this.autodeapreensao.rp = value.RP;
    this.autodeapreensao.ap = value.AP;
    this.autodeapreensao.servico = value.SV;
    go(this.autodeapreensao);

  }


  // precisei criar um variavel logradouro para permitir ao plantão
  // verificar qual o bairro daquele endereço
  public handleAddress(address: any) {
    this.logradouro = address.address_components[0].long_name;
    this.autodeapreensao.dataapreensao = this.formatacoes.gerarMomentData(this.autodeapreensao.dataapreensao);
    go(this.formatacoes.formatarEndereco(this.autodeapreensao.logradouro, this.autodeapreensao.bairro));
  }


  ngOnDestroy(): void {

  }

}
