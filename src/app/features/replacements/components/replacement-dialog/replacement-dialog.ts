import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { Replacements, SpacesEnum } from '../../services/replacements';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Button } from "primeng/button";
import { Select } from "primeng/select";
import { Dialog } from "primeng/dialog";
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-replacement-dialog',
  imports: [InputErrorMessageHandler, Button, Select, CountdownComponent, Dialog, InputText],
  templateUrl: './replacement-dialog.html',
  styleUrl: './replacement-dialog.css',
})
export class ReplacementDialog  extends BaseComponent {
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
