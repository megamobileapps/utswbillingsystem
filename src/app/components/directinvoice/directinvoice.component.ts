import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectinvoiceFormComponent } from './directinvoice-form.component';

@Component({
  selector: 'app-directinvoice',
  standalone: true,
  imports: [CommonModule, DirectinvoiceFormComponent],
  templateUrl: './directinvoice.component.html',
  styleUrls: ['./directinvoice.component.css']
})
export class DirectinvoiceComponent {

}
