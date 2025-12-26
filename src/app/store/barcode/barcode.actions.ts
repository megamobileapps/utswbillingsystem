import { createAction, props } from '@ngrx/store';

// For now, using 'any' as the model for a barcode is not ideal.
// TODO: Replace 'any' with a strong-typed Barcode model when available.
export interface Barcode {
  id: string;
  [key: string]: any;
}


export const loadBarcodes = createAction(
  '[Barcode] Load Barcodes'
);

export const loadBarcodesSuccess = createAction(
  '[Barcode] Load Barcodes Success',
  props<{ barcodes: Barcode[] }>()
);

export const loadBarcodesFailure = createAction(
  '[Barcode] Load Barcodes Failure',
  props<{ error: any }>()
);
