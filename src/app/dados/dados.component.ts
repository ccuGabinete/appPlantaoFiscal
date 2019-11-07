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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
  gp: string;
  disabledLogradouro = true; // mantém o logradouro bloqueado
  myControl = new FormControl();
  myControlBairros = new FormControl();
  myControlLacres = new FormControl();
  quantidadeAutos = 5000;
  disabled = false;
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
    public lacre: Lacre,
    public bairro: Bairro,
    private grupo: Grupo,
    private geocodeservice: GeocodeService,
    private router: Router,
    private logado: LogadoService,
    private formatacoes: FormatacoesService,
    private buscarLacre: BuscalacreService,
    private matsnackbarService: MatsnackbarService,
    private avisocamposservice: AvisocamposService,
    private autoservice: AutoService
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
    this.lacre = new Lacre();
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
    });

    this.autoservice.contarAutos().subscribe(data => {
      this.quantidadeAutos = this.quantidadeAutos + data.body.quantidade;
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
    this.disabledLogradouro = false;
  }

  onchangeLacre() {
    this.lacre.numero = this.formatacoes.colocaZeros(this.lacre.numero);
  }


  onDeleteLacre(value: string) {
    const index = this.listaLacres.findIndex(t => t.numero === value);
    this.listaLacres.splice(index, 1);
  }

  onFocusLacre() {
    this.lacre = new Lacre();
  }

  onChangeQuantidade(lacre: Lacre) {
    // tslint:disable-next-line: radix
    if (parseInt(lacre.quantidade) > 9999) {
      lacre.quantidade = '9999';
      go(lacre.quantidade);
    }
    this.lacre.quantidade = this.formatacoes.completaZeros(lacre.quantidade);
    this.onBuscarLacre(this.lacre);
  }


  // precisei criar um variavel logradouro para permitir ao plantão
  // verificar qual o bairro daquele endereço
  public handleAddress(address: any) {
    this.logradouro = address.address_components[0].long_name;
    this.autodeapreensao.logradouro = this.logradouro;
    const local = this.formatacoes.formatarEndereco(this.autodeapreensao);
    this.geocodeservice.getGeoCode(local).subscribe(data => {

      if (data.status === 200) {
        const geo = data.body.results[0].geometry.location;
        this.autodeapreensao.lat = geo.lat;
        this.autodeapreensao.lng = geo.lng;
      }
    }, (error) => {
      this.avisocamposservice.mudarAviso(4);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    });
  }

  ngOnDestroy(): void {

  }

  onBuscarLacre(lacre: Lacre) {
    this.buscarLacre.arrayAtual.subscribe(data => {
      const index = data.findIndex(x => x.numero === lacre.numero);
      if (index !== -1) {
        data[index].pos = (this.quantidadeAutos + 1).toString();
        data[index].auto = this.autodeapreensao.numero;
        data[index].quantidade = this.lacre.quantidade;
        data[index].grupo = this.lacre.grupo;
        data[index].acao = 'atualizar';

        // se o status for igual a 07 então ele tem processo
        // senão ele será marcado com 00, ou seja, deu entrada no GCD
        if (data[index].status !== '07') {
          data[index].status = '00';
        }
        this.listaLacres.push(data[index]);

      } else {
        const lc = new Lacre();
        lc.pos = (this.quantidadeAutos + 1).toString();
        lc.auto = this.autodeapreensao.numero;
        lc.data = this.formatacoes.gerarData(true);
        lc.numero = lacre.numero;
        lc.grupo = this.lacre.grupo;
        lc.quantidade = this.lacre.quantidade;
        lc.processo = '00000000000000';
        lc.codigo = 'aaaa';
        lc.status = '00';
        lc.acao = 'salvar';
        this.listaLacres.push(lc);
      }

    });
  }

  onSelectGrupo(lacre: Lacre, grupo: string) {
    lacre.grupo = grupo;
    go(lacre);
  }

  onTestCampos(): boolean {
    if (
      typeof this.autodeapreensao.numero === 'undefined' ||
      typeof this.autodeapreensao.matricula === 'undefined' ||
      typeof this.autodeapreensao.dataapreensao === 'undefined' ||
      typeof this.autodeapreensao.hora === 'undefined' ||
      typeof this.autodeapreensao.bairro === 'undefined' ||
      typeof this.autodeapreensao.logradouro === 'undefined' ||
      typeof this.autodeapreensao.origem === 'undefined'

    ) {
      this.avisocamposservice.mudarAviso(2);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
      return false;
    } else if (this.listaLacres.length > 0) {
      let indexQuantidade = 0;
      let indexGrupo = 0;
      indexQuantidade = this.listaLacres.findIndex(x => x.quantidade === null);
      indexGrupo = this.listaLacres.findIndex(x => x.grupo === '00');
      if (indexQuantidade !== -1 || indexGrupo !== -1) {
        this.avisocamposservice.mudarAviso(6);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  onSubmit() {
    this.disabled = true;
    this.autodeapreensao.pos = (this.quantidadeAutos + 1).toString();
      this.autodeapreensao.dataapreensao = this.formatacoes.gerarMomentData(this.autodeapreensao.dataapreensao);
    if (this.onTestCampos()) {

      this.autoservice.salvar(this.autodeapreensao).subscribe(data => {
        this.disabled = false;
        this.avisocamposservice.mudarAviso(3);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
      }, error => {
        this.avisocamposservice.mudarAviso(4);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
      });

      const atualizar = this.listaLacres.filter((x) => {
        return x.acao === 'atualizar';
      });

      const salvar = this.listaLacres.filter((x) => {
        return x.acao === 'salvar';
      });

      if (salvar.length > 0) {
        salvar.forEach(t => {
          this.buscarLacre.salvar(t).subscribe(() => { }, error => {
            this.avisocamposservice.mudarAviso(4);
            this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
          });
        });
      }

      if (atualizar.length > 0) {
        atualizar.forEach(t => {
          this.buscarLacre.atualizar(t).subscribe(() => { }, error => {
            this.avisocamposservice.mudarAviso(4);
            this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
          });
        });
      }

    }
  }


}
