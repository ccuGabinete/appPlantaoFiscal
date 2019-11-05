import { TestBed } from '@angular/core/testing';

import { FormatacoesService } from './formatacoes.service';

describe('FormatacoesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormatacoesService = TestBed.get(FormatacoesService);
    expect(service).toBeTruthy();
  });
});
