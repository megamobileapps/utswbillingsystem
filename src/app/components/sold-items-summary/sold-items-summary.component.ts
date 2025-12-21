import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InventoryComponent } from '../inventory/inventory.component';
import { FilteredBillsDialogComponent } from '../filtered-bills-dialog/filtered-bills-dialog.component';

export interface SoldItemSummary {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'app-sold-items-summary',
  templateUrl: './sold-items-summary.component.html',
  styleUrls: ['./sold-items-summary.component.css']
})
export class SoldItemsSummaryComponent implements OnChanges {

  @Input() invoicelist: InvoiceDataItem[] = [];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  soldItemsSummary: SoldItemSummary[] = [];
  dataSource = new MatTableDataSource<SoldItemSummary>(this.soldItemsSummary);

  displayedColumns: string[] = ['productName', 'quantity', 'price', 'discount', 'total', 'actions'];

  constructor(private dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoicelist'] && changes['invoicelist'].currentValue) {
      this.processInvoices(this.invoicelist);
    }
  }

  processInvoices(invoices: InvoiceDataItem[]) {
    const summaryMap = new Map<string, SoldItemSummary>();

    invoices.forEach(invoice => {
      if (invoice.invoicedata) {
        try {
          let items: UTSWCartItem[] = JSON.parse(invoice.invoicedata);
          // As per requirement, parse twice
          if (typeof items === 'string') {
            items = JSON.parse(items);
          }

          items.forEach(item => {
            const productName = item.productName as string;
            if (summaryMap.has(productName)) {
              const existingItem = summaryMap.get(productName)!;
              existingItem.quantity += item.quantity;
              existingItem.discount += item.discount;
              existingItem.total += item.productPrice * item.quantity;
            } else {
              summaryMap.set(productName, {
                productName: productName,
                quantity: item.quantity,
                price: item.productPrice,
                discount: item.discount,
                total: item.productPrice * item.quantity,
              });
            }
          });
        } catch (error) {
          console.error('Error parsing invoicedata:', error, invoice.invoicedata);
        }
      }
    });

    this.soldItemsSummary = Array.from(summaryMap.values());
    this.dataSource.data = this.soldItemsSummary;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openInventoryDialog(item: SoldItemSummary): void {
    this.dialog.open(InventoryComponent, {
      width: '80%',
      data: item
    });
  }

  showBillsForItem(item: SoldItemSummary): void {
    const filteredInvoices = this.invoicelist.filter(invoice => {
      if (!invoice.invoicedata) {
        return false;
      }
      try {
        let items: UTSWCartItem[] = JSON.parse(invoice.invoicedata);
        if (typeof items === 'string') {
          items = JSON.parse(items);
        }
        return items.some(invoiceItem => invoiceItem.productName === item.productName);
      } catch (error) {
        console.error('Error parsing invoicedata:', error, invoice.invoicedata);
        return false;
      }
    });

    this.dialog.open(FilteredBillsDialogComponent, {
      width: '80%',
      data: filteredInvoices
    });
  }
}