import { TestBed } from '@angular/core/testing';

import { MatsnackbarService } from './matsnackbar.service';

describe('MatsnackbarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MatsnackbarService = TestBed.get(MatsnackbarService);
    expect(service).toBeTruthy();
  });
});
