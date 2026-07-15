import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  const pipe = new DateFormatPipe();
  const expectDate = (
    actual: Date | null,
    year: number,
    month: number,
    day: number
  ): void => {
    expect(actual).not.toBeNull();
    expect(actual?.getFullYear()).toBe(year);
    expect(actual?.getMonth()).toBe(month - 1);
    expect(actual?.getDate()).toBe(day);
  };

  it('parses an unambiguous day-first date', () => {
    expectDate(pipe.transform('25-06-24'), 2024, 6, 25);
  });

  it('parses an unambiguous month-first date', () => {
    expectDate(pipe.transform('06-25-24'), 2024, 6, 25);
  });

  it('defaults ambiguous numeric dates to day-first', () => {
    expectDate(pipe.transform('05-06-24'), 2024, 6, 5);
  });

  it('parses ISO date-only values without a timezone shift', () => {
    expectDate(pipe.transform('2024-06-25'), 2024, 6, 25);
  });

  it('rejects invalid numeric dates', () => {
    expect(pipe.transform('31-02-24')).toBeNull();
  });
});
