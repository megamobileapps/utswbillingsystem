import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import * as BillActions from './bill.actions';

export interface BillState extends EntityState<InvoiceDataItem> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
}

export const billAdapter: EntityAdapter<InvoiceDataItem> = createEntityAdapter<InvoiceDataItem>({
  selectId: (bill: InvoiceDataItem) => bill.invoicenumber,
});

export const initialState: BillState = billAdapter.getInitialState({
  status: 'pending',
  error: null,
});

export const billReducer = createReducer(
  initialState,
  on(BillActions.loadBills, (state): BillState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(BillActions.loadBillsSuccess, (state, { bills }): BillState =>
    billAdapter.setAll(bills, { ...state, status: 'success', error: null })
  ),
  on(BillActions.loadBillsFailure, (state, { error }): BillState => ({
    ...state,
    status: 'error',
    error: error,
  })),
  on(BillActions.createBill, (state): BillState => ({
    ...state,
    status: 'loading', // Or a more specific 'creating' status if you prefer
    error: null,
  })),
  on(BillActions.createBillSuccess, (state, { bill }): BillState =>
    billAdapter.addOne(bill, { ...state, status: 'success', error: null })
  ),
  on(BillActions.createBillFailure, (state, { error }): BillState => ({
    ...state,
    status: 'error',
    error: error,
  }))
);
