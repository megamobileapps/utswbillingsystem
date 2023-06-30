import { Pipe, PipeTransform } from '@angular/core';
import { InOfficePrice } from '../models/inoffice';


@Pipe({
    name: 'categoryfilter',
    pure: false
})
export class CategoryfilterPipe implements PipeTransform {
    transform(items: InOfficePrice[], filter: String): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item.grade == filter);
    }
}