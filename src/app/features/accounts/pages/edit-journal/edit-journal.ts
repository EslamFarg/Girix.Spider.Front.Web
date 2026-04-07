import { Component, input } from '@angular/core';
import { JournalForm } from '../../components/journal-form/journal-form';
import { BaseComponent } from '@/components';

@Component({
  selector: 'app-edit-journal',
  imports: [JournalForm],
  templateUrl: './edit-journal.html',
  styleUrl: './edit-journal.css',
})
export class EditJournal extends BaseComponent {
  id = input.required<number>();
}
