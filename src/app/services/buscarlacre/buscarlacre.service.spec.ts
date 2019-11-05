import { TestBed } from '@angular/core/testing';

import { BuscarlacreService } from './buscarlacre.service';

describe('BuscarlacreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BuscarlacreService = TestBed.get(BuscarlacreService);
    expect(service).toBeTruthy();
  });
});
