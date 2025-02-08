import { Component, OnInit, afterNextRender } from '@angular/core';
import { NgxAngoraService } from '../../projects/ngx-angora-css-library/src/public-api';

@Component({
    selector: 'app-root',
    imports: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  public combos: { [key: string]: string[] } = {
    Abtn: [
      'ank-borderWidth-VAL1DEF4pxDEF ank-m-VAL2DEF1rem__autoDEF ank-p-VAL3DEF0_5remDEF ank-rounded-VAL4DEF0_5remDEF',
    ],
  };
  constructor(private _ank: NgxAngoraService) {
    this._ank.pushCombos(this.combos);
    afterNextRender(() => {
      this._ank.checkSheet();
      this._ank.changeDebugOption(true);
      this.cssCreate();
    });
  }
  ngOnInit(): void {}
  cssCreate() {
    this._ank.cssCreate();
  }
}
