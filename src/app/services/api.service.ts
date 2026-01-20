import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface JobSearchResult {
  id: number;
  company_name: string;
  job_id: string | null;
  url: string | null;
  title: string | null;
  function: string | null;
  level: string | null;
  contract_type: string | null;
  work_location: string | null;
  work_location_short: string | null;
  all_locations: string | null;
  country: string | null;
  department: string | null;
  flexibility: string | null;
  keywords: string | null;
  date_added: string | null;
  first_seen: string | null;
  last_seen: string | null;
}

export interface PaginatedJobSearchResult {
  jobs: JobSearchResult[];
  total: number;
  skip: number;
  limit: number;
}

export interface FilterOptions {
  companies: string[];
  levels: string[];
  functions: string[];
}

export interface JobSearchParams {
  company_name?: string;
  company_names?: string[];
  found_on_date?: string;
  job_status?: 'new' | 'existing' | 'removed';
  title_contains?: string;
  title_regex?: string;
  level?: string;
  levels?: string[];
  function?: string;
  function_regex?: string;
  skip?: number;
  limit?: number;
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

  getFilterOptions(): Observable<FilterOptions> {
    const url = `${this.getApiUrl()}/api/jobs/filters`;
    return this.http.get<FilterOptions>(url, { headers: this.getHeaders() });
  }

  searchJobs(params: JobSearchParams): Observable<PaginatedJobSearchResult> {
    const url = `${this.getApiUrl()}/api/jobs`;
    let httpParams = new HttpParams();

    if (params.company_name) {
      httpParams = httpParams.set('company_name', params.company_name);
    }
    if (params.company_names && params.company_names.length > 0) {
      httpParams = httpParams.set('company_names', params.company_names.join(','));
    }
    if (params.found_on_date) {
      httpParams = httpParams.set('found_on_date', params.found_on_date);
    }
    if (params.job_status) {
      httpParams = httpParams.set('job_status', params.job_status);
    }
    if (params.title_contains) {
      httpParams = httpParams.set('title_contains', params.title_contains);
    }
    if (params.title_regex) {
      httpParams = httpParams.set('title_regex', params.title_regex);
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    if (params.levels && params.levels.length > 0) {
      httpParams = httpParams.set('levels', params.levels.join(','));
    }
    if (params.function) {
      httpParams = httpParams.set('function', params.function);
    }
    if (params.function_regex) {
      httpParams = httpParams.set('function_regex', params.function_regex);
    }
    if (params.skip !== undefined) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<PaginatedJobSearchResult>(url, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  testConnection(): Observable<any> {
    const url = `${this.getApiUrl()}/`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
