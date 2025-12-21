import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
})
export class FilteredBillsDialogComponent {
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
  ];

  constructor(
    public dialogRef: MatDialogRef<FilteredBillsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDataItem[]
  ) {
    this.dataSource = new MatTableDataSource(data);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}