import { IGrupo } from '../../interfaces/grupo/igrupo';
export class Grupo {
  getGrupos(): IGrupo[] {
    return [
      { tipo: 'ACESSÓRIOS AUTOMOTIVOS', grupo: '01' },
      { tipo: 'ACESSÓRIOS DE INFORMÁTICA', grupo: '02' },
      { tipo: 'ARTESANATO/SUVINIR', grupo: '03' },
      { tipo: 'BARRACA PADRÃO', grupo: '04' },
      { tipo: 'BEBIDAS ALCOÓLICAS', grupo: '05' },
      { tipo: 'BEBIDAS EM GARRFAS DE VIDRO', grupo: '06' },
      { tipo: 'BEBIDAS NÃO ALCOÓLICAS', grupo: '07' },
      { tipo: 'BICICLETA', grupo: '08' },
      { tipo: 'BOLSAS E MOCHILAS', grupo: '09' },
      { tipo: 'BOTIJÃO DE GÁS', grupo: '10' },
      { tipo: 'BRINQUEDOS', grupo: '11' },
      { tipo: 'BURRO SEM RABO', grupo: '12' },
      { tipo: 'CADEIRA', grupo: '13' },
      { tipo: 'CALÇADO', grupo: '14' },
      { tipo: 'CARRINHO DE CARGA', grupo: '15' },
      { tipo: 'CHURRASQUEIRA', grupo: '16' },
      { tipo: 'ELETRODOMÉSTICO', grupo: '17' },
      { tipo: 'ELETRÔNICOS', grupo: '18' },
      { tipo: 'ENGENHO PUBLICITÁRIO', grupo: '19' },
      { tipo: 'GRANDES ESTRUTURAS', grupo: '20' },
      { tipo: 'GUARDA CHUVA', grupo: '21' },
      { tipo: 'ISOPOR', grupo: '22' },
      { tipo: 'LIVRO', grupo: '23' },
      { tipo: 'MATERIAL DE PRAIA', grupo: '24' },
      { tipo: 'MESA', grupo: '25' },
      { tipo: 'MIDIA', grupo: '26' },
      { tipo: 'MOENDA', grupo: '27' },
      { tipo: 'OCULOS', grupo: '28' },
      { tipo: 'PAPELARIA E BAZAR', grupo: '29' },
      { tipo: 'PERECÍVEIS', grupo: '30' },
      { tipo: 'QUENTINHA', grupo: '31' },
      { tipo: 'QUINQUILHARIA', grupo: '32' },
      { tipo: 'TABULEIRO', grupo: '33' },
      { tipo: 'TRICÍCLO', grupo: '34' },
      { tipo: 'UTENSÍLIOS DE CARROÇA', grupo: '35' },
      { tipo: 'VEÍCULO AUTOMOTOR', grupo: '36' },
      { tipo: 'VESTUÁRIO', grupo: '37' }
    ];
  }

  getTipo(grupo: string): string {
    const index = this.getGrupos().findIndex(x => x.grupo === grupo);
    return this.getGrupos()[index].tipo;
  }
}
