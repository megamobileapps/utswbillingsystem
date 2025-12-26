import { createFeatureSelector, createSelector } from '@ngrx/store';
import { billAdapter, BillState } from './bill.reducer';

export const selectBillState = createFeatureSelector<BillState>('bills');

const { selectAll } = billAdapter.getSelectors();

export const selectAllBills = createSelector(
  selectBillState,
  selectAll
);

export const selectBillStatus = createSelector(
  selectBillState,
  (state: BillState) => state.status
);

export const selectBillError = createSelector(
  selectBillState,
  (state: BillState) => state.error
);
