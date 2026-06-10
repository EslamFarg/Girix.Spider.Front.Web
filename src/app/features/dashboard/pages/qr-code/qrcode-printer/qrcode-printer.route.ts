import { Routes } from "@angular/router";

export const QrcodePrinterRoute:Routes=[
    {
        path:'qrcode-printer',
        loadComponent:()=>import('./qrcode-printer').then(m=>m.QrcodePrinter),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-qrcode-printer/explorer-qrcode-printer').then(m=>m.ExplorerQrcodePrinter)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-qrcode-printer/add-qrcode-printer').then(m=>m.AddQrcodePrinter)
            }
        ]
    }
]