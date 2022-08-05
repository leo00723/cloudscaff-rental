import { Injectable } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CalculationService {
  // START: functions to update each rate category
  calcScaffoldRate(scaffoldRef: FormControl) {
    switch (scaffoldRef.get('rate').value.code) {
      case 1:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('length').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 2:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('width').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 3:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('height').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 4:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('length').value *
                scaffoldRef.get('width').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 5:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('length').value *
                scaffoldRef.get('height').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 6:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('height').value *
                scaffoldRef.get('width').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 7:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('length').value *
                scaffoldRef.get('width').value *
                scaffoldRef.get('height').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 8:
        {
          scaffoldRef
            .get('total')
            .setValue(
              ((scaffoldRef.get('length').value *
                scaffoldRef.get('height').value) /
                10) *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 9:
        {
          scaffoldRef
            .get('total')
            .setValue(
              scaffoldRef.get('length').value *
                scaffoldRef.get('lifts').value *
                scaffoldRef.get('rate').value.rate
            );
        }
        break;
      case 0: {
        scaffoldRef.get('total').setValue(scaffoldRef.get('rate').value.rate);
      }
    }
    scaffoldRef
      .get('total')
      .setValue(+scaffoldRef.get('total').value.toFixed(2));
    this.calcHireRate2(scaffoldRef);
    if (+scaffoldRef.get('extraHirePercentage').value > 0) {
      scaffoldRef
        .get('extraHire')
        .setValue(
          +scaffoldRef.get('total').value *
            (+scaffoldRef.get('extraHirePercentage').value / 100)
        );
    }
  }

  calcBoardRate(ref: FormControl) {
    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 2:
        {
          ref
            .get('total')
            .setValue(
              ref.get('width').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 3:
        {
          ref
            .get('total')
            .setValue(
              ref.get('height').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 4:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    if (+ref.get('extraHirePercentage').value > 0) {
      ref
        .get('extraHire')
        .setValue(
          +ref.get('total').value *
            (+ref.get('extraHirePercentage').value / 100)
        );
    }
  }

  calcAttachmentRate(ref: FormControl) {
    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(ref.get('length').value * ref.get('rate').value.rate);
        }
        break;
      case 2:
        {
          ref
            .get('total')
            .setValue(ref.get('width').value * ref.get('rate').value.rate);
        }
        break;
      case 3:
        {
          ref
            .get('total')
            .setValue(ref.get('height').value * ref.get('rate').value.rate);
        }
        break;
      case 4:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 5:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('height').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 6:
        {
          ref
            .get('total')
            .setValue(
              ref.get('height').value *
                ref.get('width').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 7:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('height').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 8:
        {
          ref
            .get('total')
            .setValue(
              ((ref.get('length').value * ref.get('height').value) / 10) *
                ref.get('rate').value.rate
            );
        }
        break;
      case 9:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('lifts').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref.get('total').setValue(ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    this.calcHireRate2(ref);

    if (+ref.get('extraHirePercentage').value > 0) {
      ref
        .get('extraHire')
        .setValue(
          +ref.get('total').value *
            (+ref.get('extraHirePercentage').value / 100)
        );
    }
  }

  calcHireRate2(field: FormControl) {
    switch (field.get('hireRate').value.code) {
      case 1:
        {
          const period = field.get('isWeeks').value
            ? field.get('daysStanding').value * 7
            : field.get('daysStanding').value;
          field
            .get('hireTotal')
            .setValue(period * field.get('hireRate').value.rate);
        }
        break;
      case 2:
        {
          field
            .get('hireTotal')
            .setValue(
              field.get('total').value *
                (field.get('hireRate').value.rate / 100)
            );
        }
        break;
      case 3:
        {
          const period = field.get('isWeeks').value
            ? field.get('daysStanding').value * 7
            : field.get('daysStanding').value;
          field
            .get('hireTotal')
            .setValue(
              field.get('total').value *
                period *
                (field.get('hireRate').value.rate / 100)
            );
        }
        break;
      case 4:
        {
          const period = field.get('isWeeks').value
            ? field.get('daysStanding').value
            : field.get('daysStanding').value / 7;
          field
            .get('hireTotal')
            .setValue(
              field.get('total').value *
                period *
                (field.get('hireRate').value.rate / 100)
            );
        }
        break;
      case 5:
        {
          const period = field.get('isWeeks').value
            ? field.get('daysStanding').value
            : field.get('daysStanding').value / 7;
          field
            .get('hireTotal')
            .setValue(period * field.get('hireRate').value.rate);
        }
        break;
      case 0: {
        field.get('hireTotal').setValue(field.get('hireRate').value.rate);
      }
    }
    field.get('hireTotal').setValue(+field.get('hireTotal').value.toFixed(2));
  }

  calcHireRate(
    hire: FormControl,
    scaffoldTotal: number,
    attachmentsArr: FormArray,
    boardsArr: FormArray
  ) {
    let attachments = 0;
    attachmentsArr.controls.forEach((c) => {
      attachments += +c.get('total').value;
    });
    let boards = 0;
    boardsArr.controls.forEach((c) => {
      boards += +c.get('total').value;
    });

    switch (hire.get('rate').value.code) {
      case 1:
        {
          const period = hire.get('isWeeks').value
            ? hire.get('daysStanding').value * 7
            : hire.get('daysStanding').value;
          hire.get('total').setValue(period * hire.get('rate').value.rate);
        }
        break;
      case 2:
        {
          hire
            .get('total')
            .setValue(
              (scaffoldTotal + attachments + boards) *
                (hire.get('rate').value.rate / 100)
            );
        }
        break;
      case 3:
        {
          const period = hire.get('isWeeks').value
            ? hire.get('daysStanding').value * 7
            : hire.get('daysStanding').value;
          hire
            .get('total')
            .setValue(
              (scaffoldTotal + attachments + boards) *
                period *
                (hire.get('rate').value.rate / 100)
            );
        }
        break;
      case 4:
        {
          const period = hire.get('isWeeks').value
            ? hire.get('daysStanding').value
            : hire.get('daysStanding').value / 7;
          hire
            .get('total')
            .setValue(
              (scaffoldTotal + attachments + boards) *
                period *
                (hire.get('rate').value.rate / 100)
            );
        }
        break;
      case 5:
        {
          const period = hire.get('isWeeks').value
            ? hire.get('daysStanding').value
            : hire.get('daysStanding').value / 7;
          hire.get('total').setValue(period * hire.get('rate').value.rate);
        }
        break;
      case 0: {
        hire.get('total').setValue(hire.get('rate').value.rate);
      }
    }
    hire.get('total').setValue(+hire.get('total').value.toFixed(2));
  }

  calcAdditionalRate(ref: FormControl) {
    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(
              ref.get('daysStanding').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    if (+ref.get('extraHirePercentage').value > 0) {
      ref
        .get('extraHire')
        .setValue(
          +ref.get('total').value *
            (+ref.get('extraHirePercentage').value / 100)
        );
    }
  }
  calcLabourRate(ref: FormControl) {
    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('rate').value.rate
        ).toFixed(2)
      );
  }
  calcTransportRate(ref: FormControl) {
    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('type').value.rate
        ).toFixed(2)
      );
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    if (+ref.get('extraHirePercentage').value > 0) {
      ref
        .get('extraHire')
        .setValue(
          +ref.get('total').value *
            (+ref.get('extraHirePercentage').value / 100)
        );
    }
  }
}
