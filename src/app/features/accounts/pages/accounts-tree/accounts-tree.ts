import { Component, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-accounts-tree',
  imports: [SectionWrapper, TreeModule, InputErrorMessageHandler, Select, Button, InputText],
  templateUrl: './accounts-tree.html',
  styleUrl: './accounts-tree.css',
})
export class AccountsTree {
  files = signal<TreeNode[]>([
    {
      label: 'حسابات',
      children: [
        {
          label: 'حساب 1',
          children: [
            { label: 'حساب 1.1', children: [{ label: 'حساب 1.1.1', children: [{ label: 'حساب 1.1.1.1' }] }] },
            { label: 'حساب 1.2' },
            { label: 'حساب 1.3' },
            { label: 'حساب 1.4' },
          ],
        },
        { label: 'حساب 2' },
        { label: 'حساب 3' },
        { label: 'حساب 4' },
      ],
    },
    {
      label: 'فاتورات',
      children: [{ label: 'فاتورة 1' }, { label: 'فاتورة 2' }, { label: 'فاتورة 3' }, { label: 'فاتورة 4' }],
    },
    {
      label: 'تقارير',
      children: [{ label: 'تقرير 1' }, { label: 'تقرير 2' }, { label: 'تقرير 3' }, { label: 'تقرير 4' }],
    },
  ]);
}
