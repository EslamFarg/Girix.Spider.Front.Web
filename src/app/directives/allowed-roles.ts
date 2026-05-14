import { AuthService } from '@/features/auth/services/auth-service';
import { Directive, effect, ElementRef, inject, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAllowedRoles]',
})
export class AllowedRolesDirective {
  private authService = inject(AuthService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input({ alias: 'appAllowedRoles', required: true })
  allowedRoles!: number[];

  constructor() {
    effect(() => {
      const userRoles = this.authService.roles();
      const hasRole = this.allowedRoles?.some((role) => userRoles.includes(role));

      if (!hasRole) {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
      } else {
        this.renderer.removeStyle(this.el.nativeElement, 'display');
      }
    });
  }
}
