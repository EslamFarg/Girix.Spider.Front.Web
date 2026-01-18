import { BaseComponent } from '@/components/base-component/base-component';
import { Component, EventEmitter, inject, ViewChild, viewChildren, ViewChildren } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Replacements, SpacesEnum } from '../../services/replacements';
import { Paginator } from 'primeng/paginator';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
@Component({
  selector: 'app-huts',
  imports: [
    InputTextModule,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    Paginator,
    CountdownComponent,
  ],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}

  replacementsService = inject(Replacements);
  openDialog() {
    this.replacementsService.openDialog(SpacesEnum.Huts);
  }

  //countdown
  // countDownEles = viewChildren<CountdownComponent>('countdown');
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}

  ngAfterViewInit() {
    // this.countDownEles().forEach((ele) => {
    // ele.begin();
    // });
  }
}
