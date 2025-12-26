import { createFeatureSelector, createSelector } from '@ngrx/store';
import { invoiceSoldItemsAdapter, InvoiceSoldItemsState } from './invoice-sold-items.reducer';

export const selectInvoiceSoldItemsState = createFeatureSelector<InvoiceSoldItemsState>('invoiceSoldItems');

const { selectAll } = invoiceSoldItemsAdapter.getSelectors();

export const selectAllInvoiceSoldItems = createSelector(
  selectInvoiceSoldItemsState,
  selectAll
);

export const selectInvoiceSoldItemsStatus = createSelector(
  selectInvoiceSoldItemsState,
  (state: InvoiceSoldItemsState) => state.status
);

export const selectInvoiceSoldItemsError = createSelector(
  selectInvoiceSoldItemsState,
  (state: InvoiceSoldItemsState) => state.error
);
