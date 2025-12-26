import { createAction, props } from '@ngrx/store';
import { InvoiceSoldItems } from 'src/app/models/invoice-data-item';

export const loadInvoiceSoldItems = createAction(
  '[Invoice Sold Items] Load Invoice Sold Items',
  props<{ startDate: string; endDate: string }>()
);

export const loadInvoiceSoldItemsSuccess = createAction(
  '[Invoice Sold Items] Load Invoice Sold Items Success',
  props<{ invoiceSoldItems: InvoiceSoldItems[] }>()
);

export const loadInvoiceSoldItemsFailure = createAction(
  '[Invoice Sold Items] Load Invoice Sold Items Failure',
  props<{ error: any }>()
);
