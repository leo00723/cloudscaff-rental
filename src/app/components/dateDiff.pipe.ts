import { Pipe, PipeTransform } from '@angular/core';
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
    return noIso
      ? differenceInDays(date2, date1) + 1
      : differenceInDays(parseISO(date2), date1) + 1;
  }
}
