import { Component, input } from '@angular/core';
import { JournalForm } from '../../components/journal-form/journal-form';
import { BaseComponent } from '@/components';

@Component({
  selector: 'app-add-journal',
  imports: [JournalForm],
  templateUrl: './add-journal.html',
  styleUrl: './add-journal.css',
})
export class AddJournal extends BaseComponent {
    id=input.required<number>();
}
