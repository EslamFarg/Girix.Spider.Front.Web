import { inject, Injectable } from '@angular/core';
import { DynamicDialogRef, DialogService as PDialogService } from 'primeng/dynamicdialog';
import { DialogType } from '../enums';
import BaseService from '@/core/services/BaseService';

@Injectable({
    providedIn: 'root',
})
export class DialogService extends BaseService {
    private dialogService = inject(PDialogService);
    private dialogRefs = new Map<DialogType, DynamicDialogRef>();

    async open(data: {
        type: DialogType;
        onClose?: (data: any) => void;
        onMaximize?: (data: any) => void;
        inputs?: any;
    }) {
        let component: any;

        switch (data.type) {
            case DialogType.LocalPlaceSelect: {
                const module = await import('@/components/local-place-select/local-place-select');
                component = module.LocalPlaceSelect;
                break;
            }
        }

        if (!component) return;
        console.log("open: ",data);

        const ref = this.dialogService.open(component, {
            modal: true,
            closable: true,
            dismissableMask: true,
            contentStyle: { overflow: 'auto' },
            style: { '--p-mask-background': '#375652e5!important', maxWidth: '50rem', width: '80%' },
            styleClass: `flex 123 flex-col ${this.loadingService.isLoading() && 'opacity-50 cursor-wait'}`,
            inputValues: data?.inputs,
            // breakpoints: {
            //     '960px': '75vw',
            //     '640px': '90vw',
            // },
        });

        if (!ref) return;

        this.dialogRefs.set(data.type, ref);
        
        ref.onClose.subscribe((closeData: any) => {
            console.log("onClose: ",closeData,data.onClose);
            data.onClose?.(closeData);
        });

        ref.onMaximize.subscribe((value) => {
            data.onMaximize?.(value);
        });

        return ref;
    }

    close = (data: { type: DialogType; data: any }) => this.dialogRefs.get(data.type)?.close(data.data);
}
