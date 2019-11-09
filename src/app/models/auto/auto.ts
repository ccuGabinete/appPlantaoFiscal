import { Lacre } from '../lacre/lacre';

export class Auto {
  agenterespcadastro: string;
  origem: string;
  numero: string;
  dataapreensao: Date;
  hora: Date;
  matricula: string;
  agente: string;
  logradouro: string;
  lognumero: string;
  bairro: string;
  cep: string;
  lat: number;
  lng: number;
  ra: string;
  ap: string;
  rp: string;
  servico: string;
  lacres: string;
  arraylacres: Array<Lacre>;
  pos: number;
  trm = [];
}
