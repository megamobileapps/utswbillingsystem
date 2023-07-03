import { Pipe, PipeTransform } from '@angular/core';
import { InOfficePrice } from '../models/inoffice';


@Pipe({
    name: 'searchstrfilter',
    pure: false
})
export class SearchStrfilterPipe implements PipeTransform {
    transform(items: InOfficePrice[], filter: String): any {
        
        if (!items || !filter) {
            return items;
        }
        filter=filter.toLowerCase();
        // var searchStr = /filter/gi;
        // console.log('searchStr'+searchStr);
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => 
            item.grade.toLowerCase().indexOf(filter.toString()) != -1
            ||item.subject.toLowerCase().indexOf(filter.toString()) != -1
            ||item.subId.toLowerCase().indexOf(filter.toString()) != -1
            || item.pcost.toString().toLowerCase().indexOf(filter.toString()) != -1
            || item.barcode.toString().toLowerCase().indexOf(filter.toString()) != -1
            );
    }
}