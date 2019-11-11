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
import { Component, OnInit } from '@angular/core';
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
import { Lacreupdate } from '../models/lacreupdate/lacreupdate';
import { PdfService } from '../services/pdf/pdf.service';
const go = console.log;

export interface User {
  matricula: string;
}

@Component({
  selector: 'app-auto',
  templateUrl: './auto.component.html',
  styleUrls: ['./auto.component.scss']
})
export class AutoComponent implements OnInit {

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
  lacresdoautoatualizar: Lacre[] = [];
  lacresrespostaintegral: Lacre[] = [];
  linha: number;
  disabled = false;
  disabledErrado = true;
  disabledCerto = true;
  disabledButao = true;
  datadorelatorio: Date;
  disabledEtiquetas = false;
  atualizar = false;
  googleoptions = {
    types: ['geocode'],
    componentRestrictions: { country: 'BR' },
    location: [-22.921712, -43.449187]
  };
  origemLacre = [
    'GM-RIO',
    'METRÔ',
    'CCU'
  ];
  listaLacres: Array<Lacre> = [];
  recebedor = [
    { local: 'CCU', id: '1' },
    { local: 'GCD', id: '2' },
    { local: 'EVENTO', id: '3' }
  ];

  constructor(
    public autodeapreensao: Auto,
    public aa: Auto,
    public agente: Agente,
    public lacre: Lacre,
    public lacreupdate: Lacreupdate,
    public bairro: Bairro,
    private grupo: Grupo,
    private geocodeservice: GeocodeService,
    private router: Router,
    private logado: LogadoService,
    private formatacoes: FormatacoesService,
    private buscarLacre: BuscalacreService,
    private matsnackbarService: MatsnackbarService,
    private avisocamposservice: AvisocamposService,
    private autoservice: AutoService,
    private pdfservice: PdfService
  ) { }

  options: Agentes[] = this.agente.getLista();
  filteredOptions: Observable<Agentes[]>;
  optionsBairros: Ibairro[] = this.bairro.getListaBairro();
  filteredOptionsBairros: Observable<Ibairro[]>;
  origemGrupo = this.grupo.getGrupos();
  filteredOptionsGrupos: Observable<IGrupo[]>;

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
    this.lacreupdate = new Lacreupdate();
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

      this.filteredOptionsGrupos = this.myControlLacres.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.tipo),
        map(tipo => tipo ? this._filterGrupo(tipo) : this.origemGrupo.slice())
      );

    // busquei todos os lacres e criei um array para armazenar esses lacres até o fim
    // da seção
    this.buscarLacre.buscarLacre().subscribe(arr => {
      arr.body.forEach(x => {
        this.lacresrespostaintegral.push(x);
      });
      const resp = this.buscarLacre.converteParaArrayDeLacres(arr.body);
      this.buscarLacre.atualizarArrayLacres(resp);
    });

    this.autoservice.contarAutos().subscribe(data => {
      this.quantidadeAutos = this.quantidadeAutos + data.body.quantidade;
      this.autodeapreensao.pos = this.quantidadeAutos + 1;
    });
  }

  displayFn(agentes?: Agentes): string | undefined {
    return agentes ? agentes.matricula : undefined;
  }

  displayFnBairros(ibairro?: Ibairro): string | undefined {
    return ibairro ? ibairro.bairro : undefined;
  }

  displayFnGrupo(igrupo?: IGrupo): string | undefined {
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

  private _filterGrupo(tipo: string): IGrupo[] {
    const filterValue = tipo.toLowerCase();

    return this.origemGrupo.filter(option => option.tipo.toLowerCase().indexOf(filterValue) === 0);
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
    const index2 = this.lacresdoautoatualizar.findIndex(t => t.numero === value);
    this.lacresdoautoatualizar.splice(index2, 1);
  }

  onFocusLacre() {
    this.lacre = new Lacre();
  }

  onChangeQuantidade(lacre: Lacre) {
    // tslint:disable-next-line: radix
    if (parseInt(lacre.quantidade) > 9999) {
      lacre.quantidade = '9999';
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
    }, () => {
      this.avisocamposservice.mudarAviso(4);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    });
  }

  onBuscarLacre(lacre: Lacre) {
    if (this.lacresdoautoatualizar.length === 0) {
      this.buscarLacre.arrayAtual.subscribe(data => {

        const index = data.findIndex(x => x.numero === lacre.numero);

        if (index !== -1) {

          //#region comentário
          /* para atualizar o campo lacre será necessário
          filtrar pelo numero do processo do lacre localizado
          todos os outros lacres que podem compor esse campo lacre
          para então retirar esse lacre localizado desse array
          lacresdoautoatualizar, mantendo todos os outros não localizados por hora
          e devolver somente esse lacre localizado já formatado, mandtendo assim a forma
          original do campo lacre na tabela*/
          //#endregion

          if (this.lacresdoautoatualizar.length === 0) {

            this.lacresdoautoatualizar = data.filter(value => {
              return value.processo === data[index].processo;
            });
          }

          this.atualizar = true;
          this.linha = data[index].linha;
          data[index].pos = this.autodeapreensao.pos;
          data[index].quantidade = this.lacre.quantidade;
          data[index].grupo = this.lacre.grupo;
          data[index].acao = 'atualizar';
          data[index].data = this.formatacoes.gerarData(true);
          data[index].recebedor = this.autodeapreensao.recebedor;
          // se o status for igual a 07 então ele tem processo
          // senão ele será marcado com 00, ou seja, deu entrada no GCD
          if (data[index].status !== '07') {
            data[index].status = '00';
          }
          this.listaLacres.push(data[index]);

        } else {
          const lc = new Lacre();
          lc.pos = this.autodeapreensao.pos;
          lc.data = this.formatacoes.gerarData(true);
          lc.numero = lacre.numero;
          lc.grupo = this.lacre.grupo;
          lc.quantidade = this.lacre.quantidade;
          lc.processo = '00000000000000';
          lc.codigo = 'aaaa';
          lc.status = '00';
          lc.acao = 'salvar';
          lc.recebedor = this.autodeapreensao.recebedor;
          this.listaLacres.push(lc);
        }

        //#region comentário
        /* Caso o plantonista tenha cadastrado novos lacres, que não foram requeridos
        e de repente aparecer um lacre que foi requerido, o array lacresdoautoatualizar assume
        o controle e  puxa todos esses lacres do this.listalacres para ele
        */
        //#endregion

        if (this.listaLacres.length > 0 && this.lacresdoautoatualizar.length > 0) {
          this.listaLacres.forEach(t => {
            // tslint:disable-next-line: no-shadowed-variable
            const index = this.lacresdoautoatualizar.findIndex(x => x.numero === t.numero);
            if (index === -1) {
              this.lacresdoautoatualizar.push(t);
            }
          });
        }
      }, error => {
        go('houve um erro aqui');
      });
    } else {
      this.atualizar = true;
      const index = this.lacresdoautoatualizar.findIndex(x => x.numero === lacre.numero);
      if (index !== -1) {

        //#region comentário
        /* para atualizar o campo lacre será necessário
        filtrar pelo numero do processo do lacre localizado
        todos os outros lacres que podem compor esse campo lacre
        para então retirar esse lacre localizado desse array
        lacresdoautoatualizar, mantendo todos os outros não localizados por hora
        e devolver somente esse lacre localizado já formatado, mandtendo assim a forma
        original do campo lacre na tabela
        IMPRTANTE!!!
        É importante deixar registrado que o que será reenviado para atualizar
        o campo lacre na tabela será o array lacresdoautoatualizar, uma vez que
        assim persistimos todos os lacres que foram solicitados no cartório e que por ventura
        não deram entrada no plabtão fiscal
        */
        //#endregion

        this.lacresdoautoatualizar[index].pos = this.autodeapreensao.pos;
        this.lacresdoautoatualizar[index].quantidade = this.lacre.quantidade;
        this.lacresdoautoatualizar[index].grupo = this.lacre.grupo;
        this.lacresdoautoatualizar[index].acao = 'atualizar';
        this.lacresdoautoatualizar[index].recebedor = this.autodeapreensao.recebedor;
        // se o status for igual a 07 então ele tem processo
        // senão ele será marcado com 00, ou seja, deu entrada no GCD
        if (this.lacresdoautoatualizar[index].status !== '07') {
          this.lacresdoautoatualizar[index].status = '00';
        }
        this.listaLacres.push(this.lacresdoautoatualizar[index]);

      } else {
        const lc = new Lacre();
        lc.pos = this.autodeapreensao.pos;
        lc.data = this.formatacoes.gerarData(true);
        lc.numero = lacre.numero;
        lc.grupo = this.lacre.grupo;
        lc.quantidade = this.lacre.quantidade;
        lc.processo = '00000000000000';
        lc.codigo = 'aaaa';
        lc.status = '00';
        lc.acao = 'salvar';
        lc.recebedor = this.autodeapreensao.recebedor;
        this.lacresdoautoatualizar.push(lc);
        this.listaLacres.push(lc);
      }
    }

  }

  onSelectGrupo(lacre: Lacre, grupo: string) {
    lacre.grupo = grupo;
  }

  onSelectedGrupo(value: any) {
    this.lacre.grupo = value.grupo;
  }

  onTestCampos(): boolean {
    if (
      typeof this.autodeapreensao.numero === 'undefined' ||
      typeof this.autodeapreensao.matricula === 'undefined' ||
      typeof this.autodeapreensao.dataapreensao === 'undefined' ||
      typeof this.autodeapreensao.hora === 'undefined' ||
      typeof this.autodeapreensao.bairro === 'undefined' ||
      typeof this.autodeapreensao.logradouro === 'undefined' ||
      typeof this.autodeapreensao.origem === 'undefined' ||
      typeof this.autodeapreensao.recebedor === 'undefined'

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
    this.autodeapreensao.dataapreensao = this.formatacoes.gerarMomentData(this.autodeapreensao.dataapreensao);
    if (this.onTestCampos()) {

      this.autoservice.salvar(this.autodeapreensao).subscribe(() => {
        this.disabled = false;
        this.avisocamposservice.mudarAviso(3);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
        this.refreshConserto();
      }, () => {
        this.avisocamposservice.mudarAviso(4);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
      });

      if (this.lacresdoautoatualizar.length === 0) {
        this.lacre.lacre = this.buscarLacre.converteParaPlanilhaExcel(this.listaLacres);
      } else {
        this.lacre.lacre = this.buscarLacre.converteParaPlanilhaExcel(this.lacresdoautoatualizar);
      }

      this.lacre.pos = this.quantidadeAutos + 1;
      this.lacre.auto = this.autodeapreensao.numero;
      this.lacre.linha = this.linha;
      this.lacre.processo = '00000000000000';

      if (!this.atualizar) {
        this.buscarLacre.salvar(this.lacre).subscribe(() => { }, () => {
          this.avisocamposservice.mudarAviso(4);
          this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
        });
      }

      if (this.atualizar) {
        this.buscarLacre.atualizar(this.lacre).subscribe(() => { }, () => {
          this.avisocamposservice.mudarAviso(4);
          this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
        });
      }
    }
  }


  //#region comentário
  /*Essa função recebe o array de lacres que possuem o mesmo número de processo do lacre
  localizado, retira esse lacre localizado do array, altera esse lacre e devolve esse lacre para a mesmo
  array, mandtendo intacto os lacres que não foram localizados, será necessário porém,
  certificar-se que a busca seja feita apenas uma vez no conjunto maoir de lacres, aquela que veio do servidor onInit
  pois dai pra frente a busca deverá ser feita nesse novo array*/
  //#endregion


  //#region update lacre

  onFocusAuto() {
    this.autodeapreensao.numero = '';
    this.lacreupdate = new Lacreupdate();
    this.disabledErrado = true;
    this.disabledCerto = true;
    this.disabledButao = true;
    this.lacresrespostaintegral.forEach((a, b) => {
      a.linha = b + 1;
    });
    this.disabledEtiquetas = false;
  }

  onFocusNumeroErrado() {
    this.lacreupdate.numeroerrado = '';
    this.lacreupdate.numerocerto = '';
    this.disabledCerto = true;
    this.disabledButao = true;
  }

  onFocusNumeroCerto() {
    this.lacreupdate.numerocerto = '';
    this.disabledButao = true;
  }

  onFocusGrupo() {

  }

  onChangeAuto(): Lacre[] {
    const response = this.lacresrespostaintegral.filter(x => x.auto === this.lacreupdate.auto);
    if (response.length > 0) {
      this.disabledErrado = false;
    } else {
      this.avisocamposservice.mudarAviso(7);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    }

    return response;
  }

  onChangeNumeroErrado() {
    this.lacreupdate.numeroerrado = this.formatacoes.colocaZeros(this.lacreupdate.numeroerrado);
    if (this.buscarString(this.lacreupdate.numeroerrado)) {
      this.disabledCerto = false;
    } else {
      this.lacreupdate.numeroerrado = '';
      this.avisocamposservice.mudarAviso(8);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    }
  }

  onChangeNumeroCerto() {
    this.lacreupdate.numerocerto = this.formatacoes.colocaZeros(this.lacreupdate.numerocerto);
    this.disabledButao = !this.buscarString(this.lacreupdate.numeroerrado);
  }

  onSubmitUpdateLacre() {
    const req = this.onChangeAuto()[0].lacre;
    const res = req.replace(this.lacreupdate.numeroerrado, this.lacreupdate.numerocerto);
    this.onChangeAuto()[0].lacre = res;
    this.buscarLacre.atualizar(this.onChangeAuto()[0]).subscribe(() => {
      this.avisocamposservice.mudarAviso(9);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
      this.refreshConserto();
    }, () => {
      this.avisocamposservice.mudarAviso(4);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 3000);
    });
  }


  buscarString(lacre: string): boolean {
    const res = lacre;
    const regex = new RegExp(res);
    let str = '';
    if (this.onChangeAuto().length > 0) {
      str = this.onChangeAuto()[0].lacre;
    }
    if (str.match(regex) !== null) {
      return true;
    } else {
      return false;
    }
  }

  refreshConserto(): void {
    this.router.navigateByUrl('/auto', { skipLocationChange: true }).then(() => {
      this.router.navigate(['dados']);
    });
  }

  //#endregion

  //#region relatório

  onImprimirRelatorio() {
    if (typeof this.autodeapreensao.recebedor !== 'undefined') {
      const data = this.datadorelatorio;
      this.buscarLacre.arrayAtual.subscribe(t => {
        const arr = t.filter(x => {
          const aux = this.formatacoes.gerarMomentData(x.data);
          return this.formatacoes.comparaData(data, aux) && x.recebedor === this.autodeapreensao.recebedor;
        });
        this.pdfservice.downloadPDF(arr, this.formatacoes.gerarMomentData(data), this.autodeapreensao.recebedor);
      });
    } else {
      this.avisocamposservice.mudarAviso(10);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1000);
    }

  }

  //#endregion

  //#region etiquetas

  onChangeAutoEtiqueta() {
    this.aa = new Auto();
    const index = this.autoservice.buscar(this.autodeapreensao).subscribe(data => {

      if (data.body.numero !== '') {
        this.aa.numero = data.body.numero;
        this.aa.pos = data.body.pos;
        this.aa.dataapreensao = data.body.dataapreensao;
        this.disabledEtiquetas = true;
      } else {
        this.autodeapreensao.numero = '';
        this.avisocamposservice.mudarAviso(7);
        this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 1500);
      }
    }, error => {
      this.avisocamposservice.mudarAviso(4);
      this.matsnackbarService.openSnackBarCampos(AvisocamposComponent, 2000);
    });
  }

  onImprimirEtiquetaAuto() {
    this.pdfservice.downloadLabelAuto(this.aa);
  }

  onImprimirEtiquetaLacre() {
    this.buscarLacre.arrayAtual.subscribe(arr => {
      const novoarray = arr.filter(x => {
        return x.auto === this.aa.numero;
      });

      this.pdfservice.downloadLabelLacre(novoarray);

    });

  }
  //#endregion
}
