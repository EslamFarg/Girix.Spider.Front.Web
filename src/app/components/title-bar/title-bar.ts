import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title-bar.html',
  styleUrl: './title-bar.css',
})
export class TitleBar implements OnInit, OnDestroy {
  private router = inject(Router);

  isMaximized = signal(false);
  isAuthPage = signal(false);
  private unsubMaximized: (() => void) | null = null;

  ngOnInit() {
    // Check if we're in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Listen for maximize/unmaximize events from main process
      this.unsubMaximized = window.electronAPI.onWindowMaximized((maximized) => {
        this.isMaximized.set(maximized);
      });

      // Initial check
      window.electronAPI.windowIsMaximized().then((maximized) => {
        this.isMaximized.set(maximized);
      });

      // Detect auth pages and switch window mode
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => {
          const onAuth = e.urlAfterRedirects.startsWith('/auth');
          this.isAuthPage.set(onAuth);
          if (onAuth) {
            window.electronAPI.setAuthMode();
          } else {
            window.electronAPI.setMainMode();
          }
        });

      // Set initial mode based on current URL
      const currentUrl = this.router.url;
      const onAuth = currentUrl.startsWith('/auth');
      this.isAuthPage.set(onAuth);
      if (onAuth) {
        window.electronAPI.setAuthMode();
      } else {
        window.electronAPI.setMainMode();
      }
    }
  }

  ngOnDestroy() {
    if (this.unsubMaximized) {
      this.unsubMaximized();
    }
  }

  minimize() {
    window.electronAPI?.windowMinimize();
  }

  maximize() {
    window.electronAPI?.windowMaximize();
  }

  close() {
    window.electronAPI?.windowClose();
  }
}
