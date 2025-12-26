import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as InventoryActions from './store/inventory/inventory.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'utswbillingsystem';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(InventoryActions.loadInventory());
  }
}

