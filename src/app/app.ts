import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./shared/components/sidebar/sidebar";
import { Header } from "./shared/components/header/header";
import { Loading } from "./shared/ui/loading/loading";
import { SHARED_IMPORTS } from './shared/shared-imports';
import { LoadingService } from './shared/ui/loading/services/loading';
import { Toastr } from "./shared/ui/toastr/toastr";
import { ToastModule, Toast } from 'primeng/toast';
import { ApplicationSettingsService } from './shared/services/application-settings-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgClass, Sidebar, NgStyle, Header, Loading, SHARED_IMPORTS, AsyncPipe, Toastr, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // !!!! Services
  _loading=inject(LoadingService);
  loading$ = this._loading.loading$;
  _applicationSettingsService=inject(ApplicationSettingsService);

  ngOnInit() {
    const settings = this._applicationSettingsService.setSettings();
    console.log('settings', settings);
    // if (settings) {
    //   this._applicationSettingsService.setSettings(settings);
    // }
  }

  
}
