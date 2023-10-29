import { Pipe, PipeTransform } from '@angular/core';
import { InOfficePrice } from '../models/inoffice';
import { genericFilterKey } from '../models/generic-filter-key';


@Pipe({
    name: 'utswgenericfilter',
    pure: false
})
export class UtswGenericfilterPipe implements PipeTransform {
    transform(items: InOfficePrice[], filter: genericFilterKey): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item[filter["fieldName"] as keyof InOfficePrice] == filter["fieldValue"]);
    }
}