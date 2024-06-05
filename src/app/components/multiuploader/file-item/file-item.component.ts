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
}
