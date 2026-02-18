import { Component, input } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { GroupForm } from '../../components/group-form/group-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-edit-group',
  imports: [SectionWrapper, Button, GroupForm],
  templateUrl: './edit-group.html',
  styleUrl: './edit-group.css',
})
export class EditGroup extends BaseComponent {
  id=input.required<number>();
}
