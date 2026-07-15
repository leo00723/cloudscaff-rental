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
      return this.isValidDate(value) ? value : null;
    }

    // Handle string dates
    if (typeof value === 'string') {
      return this.parseDateString(value);
    }

    // Handle timestamp numbers
    if (typeof value === 'number') {
      const date = new Date(value);
      return this.isValidDate(date) ? date : null;
    }

    // If we can't convert it, return null
    return null;
  }

  private parseDateString(value: string): Date | null {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    // Parse numeric dates ourselves because JavaScript treats them as month-first.
    // If both parts could be a month, use the South African day-first convention.
    const numericDate = trimmedValue.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/
    );
    if (numericDate) {
      const firstPart = Number(numericDate[1]);
      const secondPart = Number(numericDate[2]);
      const year = this.normaliseYear(Number(numericDate[3]));

      const month =
        firstPart > 12
          ? secondPart
          : secondPart > 12
          ? firstPart
          : secondPart;
      const day =
        firstPart > 12
          ? firstPart
          : secondPart > 12
          ? secondPart
          : firstPart;

      return this.createDate(year, month, day);
    }

    // Keep ISO date-only values in local time so their displayed day cannot shift
    // because of a timezone conversion.
    const isoDate = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDate) {
      return this.createDate(
        Number(isoDate[1]),
        Number(isoDate[2]),
        Number(isoDate[3])
      );
    }

    const date = new Date(trimmedValue);
    return this.isValidDate(date) ? date : null;
  }

  private normaliseYear(year: number): number {
    if (year >= 100) {
      return year;
    }

    return year >= 70 ? 1900 + year : 2000 + year;
  }

  private createDate(year: number, month: number, day: number): Date | null {
    const date = new Date(year, month - 1, day);

    // Date rolls invalid values (such as 31-02) into the next month, so compare
    // every part before accepting the result.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  private isValidDate(date: Date): boolean {
    return !isNaN(date.getTime());
  }
}
