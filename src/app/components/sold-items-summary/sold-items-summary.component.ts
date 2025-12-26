import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InventoryComponent } from '../inventory/inventory.component';
import { FilteredBillsDialogComponent } from '../filtered-bills-dialog/filtered-bills-dialog.component';
import { InventoryItem } from 'src/app/models/inoffice';
import { Store } from '@ngrx/store';
import { selectAllInventory } from 'src/app/store/inventory/inventory.selectors';
import { take } from 'rxjs/operators';

export interface SoldItemSummary {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  productId:string|null|undefined;
  matchType: 'exact' | 'approximate' | 'none';
}

@Component({
  selector: 'app-sold-items-summary',
  templateUrl: './sold-items-summary.component.html',
  styleUrls: ['./sold-items-summary.component.css']
})
export class SoldItemsSummaryComponent implements OnInit, OnChanges {

  @Input() invoicelist: InvoiceDataItem[] = [];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  soldItemsSummary: SoldItemSummary[] = [];
  dataSource = new MatTableDataSource<SoldItemSummary>(this.soldItemsSummary);
  private inventory: InventoryItem[] = [];

  displayedColumns: string[] = ['productName', 'quantity', 'price', 'discount', 'total', 'actions'];

  constructor(
    private dialog: MatDialog,
    private store: Store
    ) { }

  ngOnInit(): void {
    this.store.select(selectAllInventory).pipe(
      take(1)
    ).subscribe(inventory => {
      this.inventory = inventory;
      if (this.invoicelist.length > 0) {
        this.processInvoices(this.invoicelist);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoicelist'] && changes['invoicelist'].currentValue) {
      // Rerun processing only if cache is ready
      if (this.inventory.length > 0) {
        this.processInvoices(this.invoicelist);
      }
    }
  }

  processInvoices(invoices: InvoiceDataItem[]) {
    const summaryMap = new Map<string, SoldItemSummary>();

    invoices.forEach(invoice => {
      if (invoice.invoicedata) {
        try {
          let items: UTSWCartItem[] = JSON.parse(invoice.invoicedata);
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
                productId: item.productId?.toString(),
                matchType: 'none' // will be updated below
              });
            }
          });
        } catch (error) {
          console.error('Error parsing invoicedata:', error, invoice.invoicedata);
        }
      }
    });

    this.soldItemsSummary = Array.from(summaryMap.values());
    this.updateMatchType();
    this.dataSource.data = this.soldItemsSummary;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateMatchType() {
    const inventoryNames = this.inventory.map(invItem => (invItem.productname as string).toLowerCase());
    this.soldItemsSummary.forEach(item => {
      const soldItemName = item.productName.toLowerCase();
      if (inventoryNames.includes(soldItemName)) {
        item.matchType = 'exact';
      } else if (inventoryNames.some(invName => invName.includes(soldItemName) || soldItemName.includes(invName))) {
        item.matchType = 'approximate';
      } else {
        item.matchType = 'none';
      }
    });
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