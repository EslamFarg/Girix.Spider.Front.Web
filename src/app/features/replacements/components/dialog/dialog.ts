import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Replacements, SpacesEnum } from '../../services/replacements';
import { Button } from 'primeng/button';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-dialog',
  imports: [DialogModule, Button, CountdownComponent, InputErrorMessageHandler, Select, InputText],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class Dialog extends BaseComponent {
  replacementsService = inject(Replacements);
  SpacesEnum = SpacesEnum;
  currentSpace = this.replacementsService.currentSpace;
  isVisible = this.replacementsService.isDialogVisible;
  changeToSpace = signal<SpacesEnum>(SpacesEnum.Rooms);
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}
  close() {
    this.replacementsService.closeDialog();
  }


  setChangeToSpace(space: SpacesEnum) {
    this.changeToSpace.set(space);
  }
}
