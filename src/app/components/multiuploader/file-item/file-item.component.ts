import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { UploadedFile } from 'src/app/models/uploadedFile.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-file-item',
  templateUrl: './file-item.component.html',
  styles: [],
})
export class FileItemComponent {
  @Input() file: UploadedFile;
  @Input() allowDelete = true;
  @Input() simplified = false;
  @Output() deleted = new EventEmitter<boolean>();
  private masterSvc: MasterService = inject(MasterService);

  deleteFile() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      await this.masterSvc.img().deleteFile(this.file.ref);
      this.deleted.emit(true);
    });
  }

  getFileIcon(): string {
    if (!this.file.type) {
      return 'document';
    }

    const type = this.file.type.toLowerCase();

    if (type.startsWith('image/')) {
      return 'image';
    }
    if (type.startsWith('video/')) {
      return 'videocam';
    }
    if (type.startsWith('audio/')) {
      return 'musical-notes';
    }
    if (type.includes('pdf')) {
      return 'document-text';
    }
    if (type.includes('word') || type.includes('doc')) {
      return 'document-text';
    }
    if (
      type.includes('excel') ||
      type.includes('spreadsheet') ||
      type.includes('csv')
    ) {
      return 'grid';
    }
    if (type.includes('powerpoint') || type.includes('presentation')) {
      return 'easel';
    }
    if (
      type.includes('zip') ||
      type.includes('rar') ||
      type.includes('7z') ||
      type.includes('tar')
    ) {
      return 'archive';
    }
    if (type.includes('text') || type.includes('txt')) {
      return 'document-text';
    }

    return 'document';
  }

  getFileExtension(): string {
    if (!this.file.file) {
      return '';
    }
    const parts = this.file.file.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  }

  getTruncatedFileName(): string {
    if (!this.file.file) {
      return '';
    }
    return this.file.file.length > 20
      ? this.file.file.slice(0, 20) + '...'
      : this.file.file;
  }
}
