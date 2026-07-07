import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-attachment-manager',
  imports: [DialogModule,NgClass],
  templateUrl: './attachment-manager.html',
  styleUrl: './attachment-manager.scss',
})

export class AttachmentManagerComponent {

  @Input() files: AttachmentFile[] = [];

  @Input() visible = false;

  @Input() readonly = false;

  @Input() title = 'الملفات المرفقة';

  @Output() visibleChange = new EventEmitter<boolean>();

  @Output() delete = new EventEmitter<number>();

  @Output() preview = new EventEmitter<AttachmentFile>();


  closeDialog() {
    this.visibleChange.emit(false);
  }

  onDelete(index: number) {
    this.delete.emit(index);
  }

  onPreview(file: AttachmentFile) {
    this.preview.emit(file);
  }

  getFileIcon(file: AttachmentFile): string {

    // const ext =
    //   file.extension ??
    //   file.name.split('.').pop()?.toLowerCase();
    const ext =
    file.extension ??
    file.name?.split('.').pop()?.toLowerCase() ??
    file.url?.split('.').pop()?.toLowerCase() ??
    '';

    switch (ext) {

      case 'pdf':
        return 'fa-file-pdf';

      case 'doc':
      case 'docx':
        return 'fa-file-word';

      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return 'fa-file-image';

      default:
        return 'fa-file';
    }

  }

  formatFileSize(size?: number): string {

    if (!size) return '';

    if (size < 1024)
      return `${size} B`;

    if (size < 1024 * 1024)
      return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / 1024 / 1024).toFixed(2)} MB`;

  }
}
