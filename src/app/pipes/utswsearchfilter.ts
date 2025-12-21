import { Pipe, PipeTransform } from '@angular/core';
import { InOfficePrice, InventoryItem } from '../models/inoffice';


@Pipe({
    name: 'searchstrfilter',
    pure: false
})
export class SearchStrfilterPipe implements PipeTransform {
    transform(items: InventoryItem[], filter: String): any {
        
        if (!items || !filter || items ==null || filter==null) {
            return items;
        }
        filter=filter.toLowerCase();
        // var searchStr = /filter/gi;
        // console.log('searchStr'+searchStr);
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => 
            item.brand != null && item.vendor != null && item.productname != null && item.mrp != null && item.barcode != null &&
            (item.brand.toString().toLowerCase().indexOf(filter.toString()) != -1
            ||item.vendor.toString().toLowerCase().indexOf(filter.toString()) != -1
            ||item.productname.toString().toLowerCase().indexOf(filter.toString()) != -1
            || item.mrp.toString().toLowerCase().indexOf(filter.toString()) != -1
            || item.barcode.toString().toLowerCase().indexOf(filter.toString()) != -1)
            );
    }
}