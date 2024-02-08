import { Component, OnInit, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxAngoraService } from '../../projects/ngx-angora-css-library/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private _ank: NgxAngoraService) {
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
