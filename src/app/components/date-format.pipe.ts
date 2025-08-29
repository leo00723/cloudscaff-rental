import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  pure: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any): Date | null {
    if (!value) {
      return null;
    }

    // Handle Firestore Timestamp objects
    if (value?.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }

    // Handle Date objects
    if (value instanceof Date) {
      return value;
    }

    // Handle string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    // Handle timestamp numbers
    if (typeof value === 'number') {
      return new Date(value);
    }

    // If we can't convert it, return null
    return null;
  }
}
