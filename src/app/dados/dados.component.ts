import { IGrupo } from './../interfaces/grupo/igrupo';
import { AutoService } from './../services/auto/auto.service';
import { AvisocamposComponent } from './../avisocampos/avisocampos.component';
import { MatsnackbarService } from './../services/matsnackbar/matsnackbar.service';
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
import { Lacre } from '../models/lacre/lacre';
import { Grupo } from '../models/grupo/grupo';
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
  disabledLogradouro = true; // mantém o logradouro bloqueado
  myControl = new FormControl();
  myControlBairros = new FormControl();
  myControlLacres = new FormControl();
  lacre: string;
  quantidadeAutos = 5000;
  googleoptions = {
    types: ['geocode'],
    componentRestrictions: { country: 'BR' },
    location: [-22.921712, -43.449187]
  };
  origemLacre = [
    'GM-RIO',
    'METRÔ'
  ];
  origemGrupo = this.grupo.getGrupos();
  listaLacres: Array<Lacre> = [];

  constructor(
    public autodeapreensao: Auto,
    public agente: Agente,
    public bairro: Bairro,
    private grupo: Grupo,
    private geocodeservice: GeocodeService,
    private router: Router,
    private logado: LogadoService,
    private formatacoes: FormatacoesService,
    private buscarLacre: BuscalacreService,
    private matsnackbarService: MatsnackbarService,
    private avisocamposservice: AvisocamposService,
    private autoservide: AutoService
  ) { }

  options: Agentes[] = this.agente.getLista();
  filteredOptions: Observable<Agentes[]>;
  optionsBairros: Ibairro[] = this.bairro.getListaBairro();
  filteredOptionsBairros: Observable<Ibairro[]>;
  optionsGrupos: IGrupo[] = this.grupo.getGrupos();
  filteredOptionsGrupo: Observable<IGrupo[]>;

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


    this.filteredOptionsGrupo = this.myControlLacres.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.tipo),
        map(tipo => tipo ? this._filterGrupos(tipo) : this.optionsGrupos.slice())
      );

    // busquei todos os lacres e criei um array para armazenar esses lacres até o fim
    // da seção
    this.buscarLacre.buscarLacre().subscribe(arr => {
      const resp = this.buscarLacre.converteParaArrayDeLacres(arr.body);
      this.buscarLacre.atualizarArrayLacres(resp);
      go(resp);
    });

    this.autoservide.contarAutos().subscribe(data => {
      this.quantidadeAutos += data.body.quantidade;
      this.autoservide.atualizarQuantidade(this.quantidadeAutos);
    });


  }

  displayFn(agentes?: Agentes): string | undefined {
    return agentes ? agentes.matricula : undefined;
  }

  displayFnBairros(ibairro?: Ibairro): string | undefined {
    return ibairro ? ibairro.bairro : undefined;
  }

  displayFnGrupos(igrupo?: IGrupo): string | undefined {
    return igrupo ? igrupo.tipo : undefined;
  }

  private _filter(matricula: string): Agentes[] {
    const filterValue = matricula.toLowerCase();

    return this.options.filter(option => option.matricula.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterBairro(bairro: string): Ibairro[] {
    const filterValue = bairro.toLowerCase();

    return this.optionsBairros.filter(option => option.bairro.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterGrupos(tipo: string): IGrupo[] {
    const filterValue = tipo.toLowerCase();

    return this.optionsGrupos.filter(option => option.tipo.toLowerCase().indexOf(filterValue) === 0);
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
    this.disabledLogradouro = false;
  }

  onchangeLacre() {
    this.lacre = this.formatacoes.colocaZeros(this.lacre);
    this.onBuscarLacre(this.lacre);
  }


  onDeleteLacre(value: string) {
    const index = this.listaLacres.findIndex(t => t.numero === value);
    this.listaLacres.splice(index, 1);
  }

  onFocusLacre() {
    this.lacre = '';
  }

  onChangeQuantidade(value: Lacre) {
    value.quantidade = this.formatacoes.completaZeros(value.quantidade);
    go(value.quantidade);
    go(value);
  }


  // precisei criar um variavel logradouro para permitir ao plantão
  // verificar qual o bairro daquele endereço
  public handleAddress(address: any) {
    this.logradouro = address.address_components[0].long_name;
    this.autodeapreensao.logradouro = this.logradouro;
    this.autodeapreensao.dataapreensao = this.formatacoes.gerarMomentData(this.autodeapreensao.dataapreensao);
    const local = this.formatacoes.formatarEndereco(this.logradouro, this.autodeapreensao.bairro);
    this.geocodeservice.getGeoCode(local).subscribe(data => {

      if (data.status === 200) {
        const geo = data.body.results[0].geometry.location;
        this.autodeapreensao.lat = geo.lat;
        this.autodeapreensao.lng = geo.lng;
        go(this.autodeapreensao);
      }
    }, (error) => {
      this.avisocamposservice.mudarAviso(4);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    });
  }

  ngOnDestroy(): void {

  }

  onBuscarLacre(lacre: string) {
    this.buscarLacre.arrayAtual.subscribe(data => {
      const index = data.findIndex(x => x.numero === lacre);
      if (index !== -1) {
        this.autoservide.quantidadeAtual.subscribe(quantidade => {
          data[index].pos = (this.quantidadeAutos + 1).toString();
          data[index].auto = this.autodeapreensao.numero;
          data[index].quantidade = null;

          // se o status for igual a 07 então ele tem processo
          // senão ele será marcado com 00, ou seja, deu entrada no GCD
          if (data[index].status !== '07') {
            data[index].status = '00';
          }
          this.listaLacres.push(data[index]);
        });
      } else {
        const lc = new Lacre();
        lc.pos = (this.quantidadeAutos + 1).toString();
        lc.auto = this.autodeapreensao.numero;
        lc.data = this.formatacoes.gerarData(true);
        lc.numero = lacre;
        lc.grupo = '00';
        lc.quantidade = '0000';
        lc.processo = '00000000000000';
        lc.codigo = 'aaaa';
        lc.status = '00';
        this.listaLacres.push(lc);
      }

    });
  }

}
