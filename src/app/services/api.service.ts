import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';

export interface DateStatistics {
  date: string;
  open_positions: number;
  newly_added: number;
  removed: number;
}

export interface CompanyStatistics {
  company_name: string;
  dates: DateStatistics[];
}

export interface JobStatistics {
  companies: CompanyStatistics[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  private getHeaders(): HttpHeaders {
    const apiKey = this.settingsService.getApiKey();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (apiKey) {
      headers = headers.set('X-API-Key', apiKey);
    }

    return headers;
  }

  private getApiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  getJobStatistics(): Observable<JobStatistics> {
    const url = `${this.getApiUrl()}/api/jobs?statistics=true`;
    return this.http.get<JobStatistics>(url, { headers: this.getHeaders() });
  }

  testConnection(): Observable<any> {
    const url = `${this.getApiUrl()}/`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
