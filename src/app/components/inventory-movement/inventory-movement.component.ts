import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { UserState } from 'src/app/shared/user/user.state';

interface MovementOption {
  key: string;
  label: string;
  field?: string;
  calculated?: boolean;
}

interface MovementOperation {
  type: 'move' | 'remove-lost' | 'remove-resized';
  from: string;
  to: string;
  quantity: number;
  comment: string;
}

@Component({
  selector: 'app-inventory-movement',
  templateUrl: './inventory-movement.component.html',
  styleUrls: ['./inventory-movement.component.scss'],
})
export class InventoryMovementComponent implements OnInit {
  @Input() inventoryItem: InventoryItem = {};
  @Output() movementCompleted = new EventEmitter<InventoryItem>();

  user: User;
  loading = false;

  movementOperation: MovementOperation = {
    type: 'move',
    from: '',
    to: '',
    quantity: 0,
    comment: '',
  };

  movementOptions: MovementOption[] = [
    { key: 'available', label: 'Available', calculated: true },
    { key: 'maintenance', label: 'Maintenance', field: 'inMaintenanceQty' },
    { key: 'damaged', label: 'Damaged', field: 'damagedQty' },
    { key: 'lost', label: 'Lost', field: 'lostQty' },
    { key: 'resized', label: 'Resized', field: 'resizedQty' },
  ];

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
  }

  ngOnInit(): void {}

  // Calculate available quantity
  calculateAvailableQty(): number {
    const total = this.inventoryItem.yardQty || 0;
    const inUse = this.inventoryItem.inUseQty || 0;
    const maintenance = this.inventoryItem.inMaintenanceQty || 0;
    const damaged = this.inventoryItem.damagedQty || 0;
    const reserved = this.inventoryItem.reservedQty || 0;

    const available = total - inUse - maintenance - damaged - reserved;
    return Math.max(0, available); // Ensure available quantity is never negative
  }

  // Get quantity by movement type
  getQuantityByType(type: string): number {
    if (type === 'available') {
      return this.calculateAvailableQty();
    }

    const option = this.movementOptions.find((opt) => opt.key === type);
    if (!option?.field) {
      return 0;
    }

    return (
      (this.inventoryItem[option.field as keyof InventoryItem] as number) || 0
    );
  }

  // Get options for "From" dropdown
  getFromOptions(): { value: string; label: string }[] {
    if (!this.isInventoryItemValid()) {
      console.warn('Cannot generate from options - invalid inventory item');
      return [];
    }

    const options = this.movementOptions
      .map((opt) => {
        const quantity = this.getQuantityByTypeSafe(opt.key);
        return {
          option: opt,
          quantity,
          value: opt.key,
          label: `${opt.label} (${quantity})`,
        };
      })
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        value: item.value,
        label: item.label,
      }));

    // Debug logging to help identify issues
    if (options.length === 0) {
      console.warn(
        'No movement options available. Inventory item:',
        this.inventoryItem
      );
      console.warn(
        'Movement options quantities:',
        this.movementOptions.map((opt) => ({
          key: opt.key,
          quantity: this.getQuantityByTypeSafe(opt.key),
        }))
      );
    }

    return options;
  }

  // Get options for "To" dropdown
  getToOptions(): { value: string; label: string }[] {
    return this.movementOptions
      .filter((opt) => opt.key !== this.movementOperation.from)
      .map((opt) => ({
        value: opt.key,
        label: opt.label,
      }));
  }

  // Track by function for better performance
  trackByValue(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  // Check if inventory item has valid data
  isInventoryItemValid(): boolean {
    return (
      this.inventoryItem &&
      typeof this.inventoryItem === 'object' &&
      this.inventoryItem.yardQty !== undefined &&
      this.inventoryItem.yardQty !== null
    );
  }

  // Get quantity with additional safety checks
  getQuantityByTypeSafe(type: string): number {
    if (!this.isInventoryItemValid()) {
      console.warn('Invalid inventory item:', this.inventoryItem);
      return 0;
    }

    return this.getQuantityByType(type);
  }

  // Validation
  isValidMovement(): boolean {
    if (
      !this.movementOperation.quantity ||
      this.movementOperation.quantity <= 0
    ) {
      return false;
    }
    if (!this.movementOperation.comment.trim()) {
      return false;
    }

    if (this.movementOperation.type === 'remove-lost') {
      // For removing lost items, just check if we have enough lost items
      const lostQty = this.inventoryItem.lostQty || 0;
      return lostQty >= this.movementOperation.quantity;
    }

    if (this.movementOperation.type === 'remove-resized') {
      // For removing resized items, just check if we have enough resized items
      const resizedQty = this.inventoryItem.resizedQty || 0;
      return resizedQty >= this.movementOperation.quantity;
    }

    // For regular moves
    if (!this.movementOperation.from || !this.movementOperation.to) {
      return false;
    }
    if (this.movementOperation.from === this.movementOperation.to) {
      return false;
    }

    const availableQty = this.getQuantityByType(this.movementOperation.from);
    return availableQty >= this.movementOperation.quantity;
  }

  // Get maximum movable quantity
  getMaxMovableQuantity(): number {
    if (this.movementOperation.type === 'remove-lost') {
      return this.inventoryItem.lostQty || 0;
    }

    if (this.movementOperation.type === 'remove-resized') {
      return this.inventoryItem.resizedQty || 0;
    }

    if (!this.movementOperation.from) {
      return 0;
    }
    return this.getQuantityByType(this.movementOperation.from);
  }

  // Set quantity to maximum available
  setMaxQuantity(): void {
    this.movementOperation.quantity = this.getMaxMovableQuantity();
  }

  // Get movement preview text
  getMovementPreview(): string {
    if (this.movementOperation.type === 'remove-lost') {
      return `Permanently removing ${this.movementOperation.quantity} lost items from inventory`;
    }

    if (this.movementOperation.type === 'remove-resized') {
      return `Permanently removing ${this.movementOperation.quantity} resized items from inventory`;
    }

    const fromLabel =
      this.movementOptions.find(
        (opt) => opt.key === this.movementOperation.from
      )?.label || '';
    const toLabel =
      this.movementOptions.find((opt) => opt.key === this.movementOperation.to)
        ?.label || '';

    return `Moving ${this.movementOperation.quantity} items from ${fromLabel} to ${toLabel}`;
  }

  // Reset form
  resetMovementForm(): void {
    this.movementOperation = {
      type: 'move',
      from: '',
      to: '',
      quantity: 0,
      comment: '',
    };
  }

  // Execute movement
  executeMovement(): void {
    if (!this.isValidMovement()) {
      return;
    }

    const confirmMessage = `${this.getMovementPreview()}. Continue?`;

    this.masterSvc.notification().presentAlertConfirm(() => {
      this.performMovement();
    }, confirmMessage);
  }

  // Perform the actual movement
  private async performMovement(): Promise<void> {
    this.loading = true;

    try {
      let logMessage = '';

      if (this.movementOperation.type === 'remove-lost') {
        // Remove lost items permanently
        const currentLostQty = this.inventoryItem.lostQty || 0;
        this.inventoryItem.lostQty =
          currentLostQty - this.movementOperation.quantity;

        logMessage = `Permanently removed ${this.movementOperation.quantity} lost items from inventory.`;
      } else if (this.movementOperation.type === 'remove-resized') {
        // Remove resized items permanently
        const currentResizedQty = this.inventoryItem.resizedQty || 0;
        this.inventoryItem.resizedQty =
          currentResizedQty - this.movementOperation.quantity;

        logMessage = `Permanently removed ${this.movementOperation.quantity} resized items from inventory.`;
      } else {
        // Regular movement
        this.adjustQuantity(
          this.movementOperation.from,
          -this.movementOperation.quantity
        );
        this.adjustQuantity(
          this.movementOperation.to,
          this.movementOperation.quantity
        );

        const fromLabel =
          this.movementOptions.find(
            (opt) => opt.key === this.movementOperation.from
          )?.label || '';
        const toLabel =
          this.movementOptions.find(
            (opt) => opt.key === this.movementOperation.to
          )?.label || '';

        logMessage = `Moved ${this.movementOperation.quantity} items from ${fromLabel} to ${toLabel}.`;
      }

      // Create log entry
      const log = {
        message: logMessage,
        user: this.user,
        date: new Date(),
        status:
          this.movementOperation.type === 'remove-lost' ||
          this.movementOperation.type === 'remove-resized'
            ? 'remove'
            : 'move',
        comment: this.movementOperation.comment,
      };

      // Add to log array
      if (this.inventoryItem.log) {
        this.inventoryItem.log.push(log);
      } else {
        this.inventoryItem.log = [log];
      }

      // Update calculated available quantity
      this.inventoryItem.calculatedAvailableQty = this.calculateAvailableQty();

      // Emit the updated item
      this.movementCompleted.emit(this.inventoryItem);

      // Reset form
      this.resetMovementForm();

      this.masterSvc
        .notification()
        .toast('Operation completed successfully', 'success');
    } catch (error) {
      console.error('Movement error:', error);
      this.masterSvc
        .notification()
        .toast('Error performing operation. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  // Adjust quantity for a specific type
  private adjustQuantity(type: string, adjustment: number): void {
    if (type === 'available') {
      // Available is calculated, so we don't adjust it directly
      return;
    }

    const option = this.movementOptions.find((opt) => opt.key === type);
    if (option?.field) {
      const currentValue =
        (this.inventoryItem[option.field as keyof InventoryItem] as number) ||
        0;
      (this.inventoryItem as any)[option.field] = currentValue + adjustment;

      // Special handling for lost and resized items - they affect total yard quantity
      if (type === 'lost' || type === 'resized') {
        const currentYardQty = this.inventoryItem.yardQty || 0;
        // When items move TO lost/resized (positive adjustment), reduce yardQty
        // When items move FROM lost/resized (negative adjustment), increase yardQty
        this.inventoryItem.yardQty = currentYardQty - adjustment;
      }
    }
  }

  // Handle from selection change
  onFromChange(): void {
    // Validate that the selected from option is still valid
    const fromOptions = this.getFromOptions();
    const isValidFrom = fromOptions.some(
      (opt) => opt.value === this.movementOperation.from
    );

    if (!isValidFrom && this.movementOperation.from) {
      console.warn(
        `Selected from option '${this.movementOperation.from}' is no longer valid`
      );
      this.movementOperation.from = '';
    }

    // Reset to and quantity when from changes
    this.movementOperation.to = '';
    this.movementOperation.quantity = 0;
  }

  // Handle operation type change
  onOperationTypeChange(): void {
    // Reset all fields when operation type changes
    this.movementOperation.from = '';
    this.movementOperation.to = '';
    this.movementOperation.quantity = 0;
  }

  // Handle quantity input to prevent over-allocation
  onQuantityChange(): void {
    const maxQuantity = this.getMaxMovableQuantity();
    if (this.movementOperation.quantity > maxQuantity) {
      this.movementOperation.quantity = maxQuantity;
    }
  }
}
