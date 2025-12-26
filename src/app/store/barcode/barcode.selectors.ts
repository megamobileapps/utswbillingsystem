import { createFeatureSelector, createSelector } from '@ngrx/store';
import { barcodeAdapter, BarcodeState } from './barcode.reducer';

export const selectBarcodeState = createFeatureSelector<BarcodeState>('barcodes');

const { selectAll } = barcodeAdapter.getSelectors();

export const selectAllBarcodes = createSelector(
  selectBarcodeState,
  selectAll
);

export const selectBarcodeStatus = createSelector(
  selectBarcodeState,
  (state: BarcodeState) => state.status
);

export const selectBarcodeError = createSelector(
  selectBarcodeState,
  (state: BarcodeState) => state.error
);
