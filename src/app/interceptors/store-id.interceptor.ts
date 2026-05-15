import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../components/auth/auth.service';

@Injectable()
export class StoreIdInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const storeId = this.authenticationService.selectedStoreId;
        if (storeId) {
            const storeIdStr = storeId.toString();
            
            // If it's a GET request, add store_id to params
            if (request.method === 'GET') {
                let params = request.params;
                if (!params.has('store_id')) {
                    params = params.append('store_id', storeIdStr);
                }
                request = request.clone({ params });
            } 
            // For POST/PUT/PATCH, we could add it to the body if it's JSON, 
            // but the backend usually handles this via the token or explicit payload.
            // Some of our backend views use query_params even for POST (like InventoryViewSet.create).
            else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
                let params = request.params;
                if (!params.has('store_id')) {
                    params = params.append('store_id', storeIdStr);
                    request = request.clone({ params });
                }
            }
        }

        return next.handle(request);
    }
}
