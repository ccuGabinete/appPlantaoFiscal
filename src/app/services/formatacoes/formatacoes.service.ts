import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { Auto } from '../../models/auto/auto';

@Injectable({
  providedIn: 'root'
})
export class FormatacoesService {

  constructor() { }

  colocaZeros(val: string) {
    const tamanho = val.length;
    if (tamanho < 8) {
      for (let i = 0; i < (8 - tamanho); i++) {
        val = '0' + val;
      }
    }

    return val;
  }

  getDataExtenso(data: string) {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'dezembro'
    ];

    // tslint:disable-next-line: prefer-const
    let mes = data.substring(3, 5);
    // tslint:disable-next-line: radix
    return data.substring(0, 2) + ' de ' + meses[parseInt(mes) - 1] + ' de ' + data.substring(6);
  }

  formataDataCarimbo(data: string) {
    return data.substring(0, 2) + ' ' + data.substring(3, 5) + ' ' + data.substring(8);
  }

  gerarData(bd?: boolean) {
    moment.updateLocale('America/Sao_Paulo', {
      parentLocale: 'pt-BR'
    });
    const data = Date.now();
    const dateMoment = moment(data);
    if (bd) {
      return dateMoment.format('DD/MM/YY');
    } else {
      return dateMoment.format('DD/MM/YYYY');
    }

  }

  gerarMomentData(date) {
    moment.defineLocale('America/Sao_Paulo', {
      parentLocale: 'pt-BR'
    });
    const dateMoment = moment(date).format('DD/MM/YYYY');
    return dateMoment;
  }

  gerarDataHora(date) {
    moment.defineLocale('America/Sao_Paulo', {
      parentLocale: 'pt-BR'
    });
    const dateMoment = moment(date).format('DD/MM/YYYY hh:mm:ss');
    return dateMoment;
  }

  formatarEndereco(auto: Auto) {
    return auto.logradouro + auto.lognumero + ', ' + auto.bairro + ', ' + 'Rio de Janeiro, RJ';
  }

  completaZeros(value: string): string {
    let strValor = value.toString();

    for (let i = 0; i < strValor.length; i++) {
      if (strValor.length < 4) {
        strValor = '0' + strValor;
      }
    }

    return strValor;
  }

}
