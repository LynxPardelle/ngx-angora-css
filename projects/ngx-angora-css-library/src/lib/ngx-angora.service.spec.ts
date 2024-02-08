import { TestBed } from '@angular/core/testing';

import { NgxAngoraService } from './ngx-angora.service';

describe('NgxAngoraService', () => {
  let service: NgxAngoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxAngoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
