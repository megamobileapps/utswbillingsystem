import { Component, OnInit } from '@angular/core';
import { InventoryService } from './services/inventory.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'utswbillingsystem';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.loadInventoryCache();
  }
}
