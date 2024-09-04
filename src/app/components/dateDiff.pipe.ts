import { Pipe, PipeTransform } from '@angular/core';
import differenceInDays from 'date-fns/differenceInDays';
import parseISO from 'date-fns/parseISO';

@Pipe({
  name: 'dateDiff',
  pure: true,
})
export class DateDiffPipe implements PipeTransform {
  transform(date1: any, date2: any) {
    if (!date1 || !date2) {
      return 0;
    }
    return differenceInDays(parseISO(date2), date1);
  }
}
