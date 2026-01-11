import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from './environment.service';

export interface AppSettings {
  apiKey?: string;
  apiUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'jobportal_settings';
  private readonly DEFAULT_API_URL = 'http://localhost:8000';
  private environmentService = inject(EnvironmentService);

  constructor() {}

  getSettings(): AppSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }

    // Use environment defaults if available
    const envApiUrl = this.environmentService.getDefaultApiUrl();
    return {
      apiUrl: envApiUrl || this.DEFAULT_API_URL
    };
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  /**
   * Get API key with fallback logic:
   * 1. User-provided key from localStorage (highest priority)
   * 2. Environment variable key from Docker (fallback)
   * 3. Undefined (no key available)
   */
  getApiKey(): string | undefined {
    const userApiKey = this.getSettings().apiKey;

    // If user has set their own key, use it
    if (userApiKey) {
      return userApiKey;
    }

    // Otherwise, fall back to environment variable key
    return this.environmentService.getDefaultApiKey();
  }

  setApiKey(apiKey: string | undefined): void {
    const settings = this.getSettings();
    settings.apiKey = apiKey;
    this.saveSettings(settings);
  }

  getApiUrl(): string {
    return this.getSettings().apiUrl || this.DEFAULT_API_URL;
  }

  setApiUrl(apiUrl: string): void {
    const settings = this.getSettings();
    settings.apiUrl = apiUrl;
    this.saveSettings(settings);
  }

  clearSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if user has overridden the default API key
   */
  hasCustomApiKey(): boolean {
    return !!this.getSettings().apiKey;
  }

  /**
   * Get the environment default API key (if available)
   */
  getEnvironmentApiKey(): string | undefined {
    return this.environmentService.getDefaultApiKey();
  }
}
