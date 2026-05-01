/// <reference types="jasmine" />
import { fakeAsync, tick } from '@angular/core/testing';
import { ItExistsDirective } from './it-exists.directive';

describe('ItExistsDirective', () => {
  it('should create an instance', () => {
    const directive = new ItExistsDirective();
    expect(directive).toBeTruthy();
  });

  it('emits after initialization when exist is true', fakeAsync(() => {
    const directive = new ItExistsDirective();
    const emitSpy = spyOn(directive.initEvent, 'emit');

    directive.exist = true;
    directive.ngOnInit();
    tick(10);

    expect(emitSpy).toHaveBeenCalled();
  }));

  it('does not emit when exist is false', fakeAsync(() => {
    const directive = new ItExistsDirective();
    const emitSpy = spyOn(directive.initEvent, 'emit');

    directive.exist = false;
    directive.ngOnInit();
    tick(10);

    expect(emitSpy).not.toHaveBeenCalled();
  }));
});
