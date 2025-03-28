import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { isSameDay } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays';
import parseISO from 'date-fns/parseISO';

@Pipe({
  name: 'dateDiff',
  pure: true,
})
export class DateDiffPipe implements PipeTransform {
  transform(date1: any, date2: any, noIso?: boolean) {
    if (!date1 || !date2) {
      return 0;
    }

    const newDate1 = Timestamp.fromDate(new Date(date1)).toDate();
    const newDate2 = Timestamp.fromDate(new Date(date2)).toDate();

    if (isSameDay(newDate2, newDate1)) {
      return 1;
    }

    return differenceInDays(newDate2, newDate1) + 1;
  }
}
