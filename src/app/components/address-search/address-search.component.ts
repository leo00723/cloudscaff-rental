/* eslint-disable @typescript-eslint/naming-convention */
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonInput } from '@ionic/angular';
import { Address } from 'src/app/models/address.model';
declare const google;

@Component({
  selector: 'app-address-search',
  templateUrl: './address-search.component.html',
})
export class AddressSearchComponent implements AfterViewInit {
  @Output() addressData = new EventEmitter<Address>();
  @ViewChild('autocomplete') autocomplete: IonInput;

  ngAfterViewInit(): void {
    this.autocomplete.getInputElement().then((ref) => {
      const autocomplete = new google.maps.places.Autocomplete(ref);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const addressNameFormat = {
          street_number: 'short_name',
          route: 'long_name',
          locality: 'long_name',
          administrative_area_level_1: 'long_name',
          neighborhood: 'long_name',
          sublocality_level_1: 'long_name',
          postal_town: 'long_name',
          country: 'long_name',
          postal_code: 'short_name',
        };
        const getAddressComp = (type) => {
          for (const component of place.address_components) {
            if (component.types[0] === type) {
              return component[addressNameFormat[type]];
            }
          }
          return '';
        };

        this.addressData.emit({
          address: place.formatted_address.split(',')[0],
          suburb: getAddressComp('sublocality_level_1')
            ? getAddressComp('sublocality_level_1')
            : getAddressComp('neighborhood'),
          city: getAddressComp('locality')
            ? getAddressComp('locality')
            : getAddressComp('administrative_area_level_1'),
          zip: getAddressComp('postal_code'),
          country: getAddressComp('country'),
        });
      });
    });
  }
}
