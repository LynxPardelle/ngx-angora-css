import { Directive } from '@angular/core';

@Directive({
  selector: '[libItExists]',
  standalone: true
})
export class ItExistsDirective {

  constructor() { }

}
