import { Component, OnInit } from '@angular/core';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartService } from 'src/app/providers/cart.provider';

@Component({
  selector: 'app-displaycart',
  templateUrl: './displaycart.component.html',
  styleUrls: ['./displaycart.component.css']
})
export class DisplaycartComponent implements OnInit {

  constructor(private _cartService:CartService) { }

  ngOnInit(): void {
  }

   get cart():Array<UTSWCartItem>{
      return this._cartService.currentCart!.invoicedatalist;
    }
}
