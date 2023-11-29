import { Validators } from '@angular/forms';

export class GstAmountPercentage {
    id = [''];
    gsttype = ['scgst', Validators.required];
    gst = ['0', Validators.required];
    hsn = ['49011010', Validators.required];
    quantity = ['1', Validators.required];
    taxableamount = ['0', Validators.required];
    gstamount = ['0', Validators.required];
}

export class GstAmountPercentageJson {
    id='';
    gsttype='scgst';
    taxableamount = '0';
    gst = '0';
    hsn = '49011010';
    quantity = '1';
    gstamount = '0';
}
