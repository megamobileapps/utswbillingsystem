import { createFeatureSelector, createSelector } from '@ngrx/store';
import { barcodeComponentAdapter, BarcodeComponentState } from './barcode-component.reducer';

export const selectBarcodeComponentState = createFeatureSelector<BarcodeComponentState>('barcodeComponents');

const { selectAll } = barcodeComponentAdapter.getSelectors();

export const selectAllBarcodeComponents = createSelector(
  selectBarcodeComponentState,
  selectAll
);

export const selectBarcodeComponentStatus = createSelector(
  selectBarcodeComponentState,
  (state: BarcodeComponentState) => state.status
);

export const selectBarcodeComponentError = createSelector(
  selectBarcodeComponentState,
  (state: BarcodeComponentState) => state.error
);
