import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import { body } from '../../services/imagens';
import { BehaviorSubject } from 'rxjs';
import { Lacre } from '../../models/lacre/lacre';
import { FormatacoesService } from '../formatacoes/formatacoes.service';
import { Grupo } from '../../models/grupo/grupo';
import { TitleCasePipe } from '@angular/common';
import { Auto } from '../../models/auto/auto';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  public pdfaviso = '';
  public buscarPdfaAviso = new BehaviorSubject(this.pdfaviso);
  pdfavisocorrente = this.buscarPdfaAviso.asObservable();
  imagemHeader = body.header;

  mudarPdfAviso(aviso: string) {
    this.buscarPdfaAviso.next(aviso);
  }

  constructor(
    private fm: FormatacoesService,
    private gp: Grupo,
    private tt: TitleCasePipe
  ) { }

  downloadPDF(arr: Lacre[], data: Date, local: string) {
    //#region variaveis
    let str = 'Auto:' + this.fm.GE(11);
    str += 'Posição' + this.fm.GE(3);
    str += 'Lacre:' + this.fm.GE(11);
    str += 'Tipo:' + this.fm.GE(65);
    str += 'QTDE:';

    //#endregion

    const coord = {

      text01: {
        texto: data,
        x: 95.5,
        y: 41
      },

      text02: {
        texto: str,
        x: 30,
        y: 49.5
      },

      text03: {
        texto: this.fm.formataLocal(local),
        x: 190,
        y: 9
      },

      ImageHeader: {
        x: 27,
        y: 5,
        w: 146.22,
        h: 30.462
      },
    };

    const doc = new jsPDF({
      orientaion: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.setProperties({
      title: 'Relatório de recebimento de lacres',
      subject: '',
      author: local,
      keywords: ' ',
      creator: 'Coordenadoria de Controle Urbano'
    });

    //#region coordenadas
    doc.addImage(this.imagemHeader, 'PNG', coord.ImageHeader.x, coord.ImageHeader.y, coord.ImageHeader.w, coord.ImageHeader.h);
    doc.text(coord.text02.texto, coord.text02.x, coord.text02.y);
    doc.text(coord.text03.texto, coord.text03.x, coord.text03.y);
    doc.setFontSize(14);
    doc.text(coord.text01.texto, coord.text01.x, coord.text01.y);
    doc.setFontSize(12);

    //#endregion

    let posicaoY = 0; // responsavel pelo eixo y
    let contarcoluna = 0; // responsável por ouvir quando os lacres passarem de 280
    let contafolha = 1; // para escutar o número da folha de doação
    arr.forEach((e, pos) => {

      posicaoY = 50 + (pos + 1) * 5 - (220 * contarcoluna);

      let str = this.fm.GE(6) + e.auto;
      str += this.fm.GE(8) + e.pos;
      str += this.fm.GE(8) + e.numero;
      str += this.fm.GE(6) + this.tt.transform(this.gp.getTipo(e.grupo));

      const obj = {
        posx: 22,
        posy: posicaoY,
        texto: str
      };
      const qtde = {
        posx: 175,
        posy: posicaoY,
        texto: e.quantidade
      }


      doc.text(obj.posx, obj.posy, obj.texto);
      doc.text(qtde.posx, qtde.posy, qtde.texto);

      if ((pos + 1) % 44 === 0) {
        contarcoluna++;
        contafolha++;
        doc.addPage();
        doc.setFontSize(14);
        doc.text(coord.text01.texto, coord.text01.x, coord.text01.y);
        doc.text(coord.text03.texto, coord.text03.x, coord.text03.y);
        doc.setFontSize(12);
        doc.text(coord.text02.texto, coord.text02.x, coord.text02.y);
        doc.addImage(this.imagemHeader, 'PNG', coord.ImageHeader.x, coord.ImageHeader.y, coord.ImageHeader.w, coord.ImageHeader.h);
        this.formatafolhacontinuacao(doc, contafolha);

      }

    });

    // doc.addImage('', 'PNG', coord.imageBody.x, coord.imageBody.y, coord.imageBody.w, coord.imageBody.h);
    doc.save('Relatório de serviço do dia ' + data);
    this.mudarPdfAviso('ok');
  }

  downloadLabelLacre(arr: Lacre[]) {

    const doc = new jsPDF({
      orientaion: 'l',
      unit: 'pt',
      format: [144, 288]
    });

    doc.setFontSize(12);
    doc.setFont('times', 'normal');


    arr.forEach((a, b, c) => {

      const coord = {

        text01: {
          texto: 'Numero: ' + a.numero,
          x: 18,
          y: 20
        },

        text02: {
          texto: 'Auto: ' + a.auto,
          x: 18,
          y: 37
        },

        text03: {
          texto: 'Posição: ' + a.pos,
          x: 18,
          y: 54
        },

        text04: {
          texto: 'Data: ' + a.data,
          x: 18,
          y: 71
        },

        text05: {
          texto: 'Grupo: ' + a.grupo,
          x: 18,
          y: 88
        },

        text06: {
          texto: 'Quantidade: ' + a.quantidade,
          x: 18,
          y: 105
        },

        text07: {
          texto: 'Etiqueta: ' + (b + 1) + ' de ' + c.length,
          x: 18,
          y: 122
        }
      };
      if (b === 0) {
        doc.text(coord.text01.texto, coord.text01.x, coord.text01.y);
        doc.text(coord.text02.texto, coord.text02.x, coord.text02.y);
        doc.text(coord.text03.texto, coord.text03.x, coord.text03.y);
        doc.text(coord.text04.texto, coord.text04.x, coord.text04.y);
        doc.text(coord.text05.texto, coord.text05.x, coord.text05.y);
        doc.text(coord.text06.texto, coord.text06.x, coord.text06.y);
        doc.text(coord.text07.texto, coord.text07.x, coord.text07.y);
      } else {
        doc.addPage();
        doc.text(coord.text01.texto, coord.text01.x, coord.text01.y);
        doc.text(coord.text02.texto, coord.text02.x, coord.text02.y);
        doc.text(coord.text03.texto, coord.text03.x, coord.text03.y);
        doc.text(coord.text04.texto, coord.text04.x, coord.text04.y);
        doc.text(coord.text05.texto, coord.text05.x, coord.text05.y);
        doc.text(coord.text06.texto, coord.text06.x, coord.text06.y);
        doc.text(coord.text07.texto, coord.text07.x, coord.text07.y);
      }

    });


    doc.save('Etiquetas dos lacres do auto nº ' + arr[0].auto);

  }

  downloadLabelAuto(auto: Auto) {
    //#region variaveis

    //#endregion

    const coord = {

      text01: {
        texto: 'Número: ' + auto.numero,
        x: 18,
        y: 33
      },

      text02: {
        texto: 'Posição: ' + auto.pos,
        x: 18,
        y: 53
      },

      text03: {
        texto: 'Data: ' + auto.dataapreensao,
        x: 18,
        y: 73
      },
    };

    const doc = new jsPDF({
      orientaion: 'l',
      unit: 'pt',
      format: [144, 288]
    });

    doc.setFontSize(12);
    doc.setFont('times', 'normal');

    //#region coordenadas
    doc.text(coord.text02.texto, coord.text02.x, coord.text02.y);
    doc.text(coord.text03.texto, coord.text03.x, coord.text03.y);
    doc.text(coord.text01.texto, coord.text01.x, coord.text01.y);
    //#endregion

    doc.save('Etiqueta do auto nº ' + auto.numero);

  }





  formatafolhacontinuacao(doc: jsPDF, pos: number) {
    doc.text('folha de anexo nº: ' + pos, 165, 280);
  }

}
