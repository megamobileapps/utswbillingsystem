import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-filtered-bills-dialog',
  templateUrl: './filtered-bills-dialog.component.html',
  styleUrls: ['./filtered-bills-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTooltipModule
  ],
})
export class FilteredBillsDialogComponent implements AfterViewInit {
  dataSource: MatTableDataSource<InvoiceDataItem>;
  displayedColumns: string[] = [
    'id',
    'invoicenumber',
    'invoicedate',
    'username',
    'phonenumber',
    'emailid',
    'amount',
    'discount',
    'payment_method',
    'actions'
  ];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<FilteredBillsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDataItem[],
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource(data);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  openBillDetails(invoice: InvoiceDataItem): void {
    this.dialogRef.close();
    this.router.navigate(['/bill-details', invoice.invoicenumber]);
  }
}