import { createAction, props } from '@ngrx/store';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';

export const loadBills = createAction(
  '[Bill] Load Bills',
  props<{ startDate: string; endDate: string }>()
);

export const loadBillsSuccess = createAction(
  '[Bill] Load Bills Success',
  props<{ bills: InvoiceDataItem[] }>()
);

export const loadBillsFailure = createAction(
  '[Bill] Load Bills Failure',
  props<{ error: any }>()
);

export const createBill = createAction(
  '[Bill] Create Bill',
  props<{ bill: InvoiceDataItem }>()
);

export const createBillSuccess = createAction(
  '[Bill] Create Bill Success',
  props<{ bill: InvoiceDataItem }>()
);

export const createBillFailure = createAction(
  '[Bill] Create Bill Failure',
  props<{ error: any }>()
);
