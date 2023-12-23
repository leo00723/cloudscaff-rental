import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
})
export class SearchableSelectComponent implements OnChanges {
  @Input() title = 'Select';
  @Input() data: any[];
  @Input() multiple = false;
  @Input() add = false;
  @Input() showInput = true;
  @Input() resetStatus = true;
  @Input() itemTextField = 'name';
  @Output() selectedChanged: EventEmitter<any> = new EventEmitter();

  isOpen = false;
  selected = [];
  filtered = [];

  constructor() {}

  ngOnChanges(): void {
    this.filtered = this.data.sort((a, b) => {
      if (this.resetStatus) {
        a.selected = false;
        b.selected = false;
      }
      if (this.leaf(a) < this.leaf(b)) {
        return -1;
      }
      if (this.leaf(a) > this.leaf(b)) {
        return 1;
      }
      return 0;
    });
  }

  open() {
    this.isOpen = true;
  }

  cancel() {
    this.isOpen = false;
  }

  select() {
    this.selected = this.data.filter((item) => item.selected);
    this.selectedChanged.emit(this.selected);
    this.isOpen = false;
  }

  itemSelected() {
    if (!this.multiple) {
      if (this.selected.length) {
        this.selected[0].selected = false;
        this.selected = [];
      }
      this.selected = this.data.filter((item) => item.selected);
      if (this.selected.length) {
        this.selectedChanged.emit(this.selected);
        this.isOpen = false;
        this.filtered = [...this.data];
      }
    }
  }

  addSelected() {
    if (this.selected.length) {
      this.selected[0].selected = false;
      this.selected = [];
    }
    this.selectedChanged.emit(['add']);
    this.isOpen = false;
  }

  filter(event: SearchbarCustomEvent) {
    const filter = event.detail.value.toLowerCase();
    this.filtered = this.data.filter((item) =>
      this.leaf(item).toLowerCase().includes(filter)
    );
  }

  leaf = (obj) =>
    this.itemTextField.split('.').reduce((value, index) => value[index], obj);
}
