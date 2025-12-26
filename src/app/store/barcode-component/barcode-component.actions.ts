import { createAction, props } from '@ngrx/store';

export interface BarcodeComponent {
  id: string;
  [key: string]: any;
}

export const loadBarcodeComponents = createAction(
  '[BarcodeComponent] Load BarcodeComponents'
);

export const loadBarcodeComponentsSuccess = createAction(
  '[BarcodeComponent] Load BarcodeComponents Success',
  props<{ barcodeComponents: BarcodeComponent[] }>()
);

export const loadBarcodeComponentsFailure = createAction(
  '[BarcodeComponent] Load BarcodeComponents Failure',
  props<{ error: any }>()
);
