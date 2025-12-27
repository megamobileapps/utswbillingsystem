import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBackendForInventory;

  constructor(private http: HttpClient) { }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${this.apiUrl}${path}`, { params });
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${path}`,
      JSON.stringify(body),
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${this.apiUrl}${path}`,
      JSON.stringify(body),
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${path}`, { observe: 'response', responseType: 'text' });
  }
}
