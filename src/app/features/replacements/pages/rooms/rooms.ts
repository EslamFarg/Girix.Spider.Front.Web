import { Component, inject } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Replacements, SpacesEnum } from '../../services/replacements';
import { RoomCard } from '@/components/room-card/room-card';

@Component({
  selector: 'app-rooms',
  imports: [SectionWrapper, InputErrorMessageHandler, InputGroupAddon, ReactiveFormsModule, InputTextModule, Paginator,RoomCard],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}



  replacementsService=inject(Replacements)
  openDialog() {
    this.replacementsService.openDialog(SpacesEnum.Rooms);
  }
}
