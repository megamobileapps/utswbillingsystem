import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {

  constructor() { }

  savePreference(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving preference', e);
    }
  }

  getPreference<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error loading preference', e);
      return null;
    }
  }

  // Specific helpers for consistent keys
  
  setInventoryDateRange(range: { start: Date | null, end: Date | null }) {
    this.savePreference('inventory_date_range', range);
  }

  getInventoryDateRange(): { start: string | null, end: string | null } | null { // Dates come back as strings from JSON
    return this.getPreference('inventory_date_range');
  }

  setBillsDateRange(range: { start: Date | null, end: Date | null }) {
    this.savePreference('bills_date_range', range);
  }

  getBillsDateRange(): { start: string | null, end: string | null } | null {
    return this.getPreference('bills_date_range');
  }

  setCatalogueTab(tab: string) {
    this.savePreference('catalogue_tab', tab);
  }

  getCatalogueTab(): string | null {
    return this.getPreference('catalogue_tab');
  }
}