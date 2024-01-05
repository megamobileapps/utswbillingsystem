import { Pipe, PipeTransform } from '@angular/core';
import { InOfficePrice, InventoryItem } from '../models/inoffice';


@Pipe({
    name: 'searchstrfilter',
    pure: false
})
export class SearchStrfilterPipe implements PipeTransform {
    transform(items: InventoryItem[], filter: String): any {
        
        if (!items || !filter) {
            return items;
        }
        filter=filter.toLowerCase();
        // var searchStr = /filter/gi;
        // console.log('searchStr'+searchStr);
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => 
            item.brand.toLowerCase().indexOf(filter.toString()) != -1
            ||item.vendor.toLowerCase().indexOf(filter.toString()) != -1
            ||item.productname.toLowerCase().indexOf(filter.toString()) != -1
            || item.mrp.toString().toLowerCase().indexOf(filter.toString()) != -1
            || item.barcode.toString().toLowerCase().indexOf(filter.toString()) != -1
            );
    }
}