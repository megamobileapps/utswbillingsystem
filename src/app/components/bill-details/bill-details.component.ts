import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { InventoryComponent } from '../inventory/inventory.component';
import { SoldItemSummary } from '../sold-items-summary/sold-items-summary.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill-details',
  templateUrl: './bill-details.component.html',
  styleUrls: ['./bill-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatTooltipModule // Add MatTooltipModule here as well
  ]
})
export class BillDetailsComponent implements OnInit {
  invoice: InvoiceDataItem | undefined;
  itemsDataSource = new MatTableDataSource<UTSWCartItem>();
  displayedColumns: string[] = ['productName', 'quantity', 'productPrice', 'total', 'actions'];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.dataService.getInvoiceDataFromServer_with_invoiceid(invoiceId).subscribe({
        next: (invoices) => {
          if (invoices && invoices.length > 0) {
            this.invoice = invoices[0];
            try {
              let items: UTSWCartItem[] = JSON.parse(this.invoice.invoicedata);
              if (typeof items === 'string') {
                items = JSON.parse(items);
              }
              this.itemsDataSource.data = items;
            } catch (error) {
              console.error('Error parsing invoicedata:', error, this.invoice.invoicedata);
            }
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching invoice details:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  getTotal(item: UTSWCartItem): number {
    return item.quantity * item.productPrice;
  }

  openInventoryDialog(item: UTSWCartItem): void {
    const soldItemSummary: SoldItemSummary = {
      productName: item.productName as string,
      quantity: item.quantity,
      price: item.productPrice,
      discount: item.discount,
      total: item.productPrice * item.quantity
    };
    this.dialog.open(InventoryComponent, {
      width: '80%',
      data: soldItemSummary
    });
  }

  printReceipt(): void {
    if (this.invoice) {
      this.router.navigate(['/receipt'], { queryParams: { invoiceid: this.invoice.invoicenumber } });
    }
  }
}