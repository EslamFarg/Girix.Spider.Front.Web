import { Component, inject } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { QrCodeComponent } from 'ng-qrcode';
import { BaseComponent } from '@/components';
import { CryptoJsService } from '../../services/crypto-js-service';
import BaseService from '@/core/services/BaseService';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-qr',
    imports: [SectionWrapper, InputErrorMessageHandler, InputGroupAddon, InputText, QrCodeComponent, TooltipModule],
    templateUrl: './qr.html',
    styleUrl: './qr.css',
})
export class Qr extends BaseComponent {
    cryptoService = inject(CryptoJsService);

    backendApiUrl = BaseService.getResolvedApiBaseUrl().replace('/v1', '');

    encryptedValue: string = '';

    ngAfterViewInit() {
        const activationCode = this.authService.get<string>('activationToken');
        const expireDate = this.authService.get<string>('expireDate');
        const crmEmail = this.authService.get<string>('crmEmail');
        const value = JSON.stringify({
            link: this.backendApiUrl ?? '',
            expiryDate: expireDate ?? '',
            cloudIdActivation: activationCode ?? '',
            email: crmEmail ?? '',
        });
        this.encryptedValue = this.cryptoService.encrypt(value);
    }

    copyUrl() {
        navigator.clipboard.writeText(this.backendApiUrl ?? '');
        this.messageService.add({ severity: 'success', summary: 'تم نسخ الرابط', detail: '' });
    }
}
