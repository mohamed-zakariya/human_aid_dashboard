import { TestBed } from '@angular/core/testing';

import { LearnersService } from './learners.service';

describe('LearnersService', () => {
  let service: LearnersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearnersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
