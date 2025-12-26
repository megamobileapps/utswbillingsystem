import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { InvoiceSoldItems } from 'src/app/models/invoice-data-item';
import * as InvoiceSoldItemsActions from './invoice-sold-items.actions';

export interface InvoiceSoldItemsState extends EntityState<InvoiceSoldItems> {
  status: 'pending' | 'loading' | 'success' | 'error';
  error: any;
}

export const invoiceSoldItemsAdapter: EntityAdapter<InvoiceSoldItems> = createEntityAdapter<InvoiceSoldItems>({
  selectId: (item: InvoiceSoldItems) => item.barcode,
});

export const initialState: InvoiceSoldItemsState = invoiceSoldItemsAdapter.getInitialState({
  status: 'pending',
  error: null,
});

export const invoiceSoldItemsReducer = createReducer(
  initialState,
  on(InvoiceSoldItemsActions.loadInvoiceSoldItems, (state): InvoiceSoldItemsState => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(InvoiceSoldItemsActions.loadInvoiceSoldItemsSuccess, (state, { invoiceSoldItems }): InvoiceSoldItemsState =>
    invoiceSoldItemsAdapter.setAll(invoiceSoldItems, { ...state, status: 'success', error: null })
  ),
  on(InvoiceSoldItemsActions.loadInvoiceSoldItemsFailure, (state, { error }): InvoiceSoldItemsState => ({
    ...state,
    status: 'error',
    error: error,
  }))
);
