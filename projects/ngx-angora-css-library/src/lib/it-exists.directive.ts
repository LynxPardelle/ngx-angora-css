import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[ankItExists]',
})
export class ItExistsDirective implements OnInit {
  @Input() exist!: boolean;

  @Output('ankItExists') initEvent: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    if (this.exist) {
      setTimeout(() => this.initEvent.emit(), 10);
    }
  }
}
