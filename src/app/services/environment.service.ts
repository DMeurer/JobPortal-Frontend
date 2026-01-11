import { Injectable } from '@angular/core';

export interface EnvironmentConfig {
  defaultApiKey?: string;
  defaultApiUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private config: EnvironmentConfig | null = null;

  constructor() {}

  async loadConfig(): Promise<void> {
    try {
      const response = await fetch('/assets/config.json');
      if (response.ok) {
        this.config = await response.json();
      } else {
        this.config = {};
      }
    } catch (error) {
      console.warn('Failed to load config.json, using defaults:', error);
      this.config = {};
    }
  }

  getDefaultApiKey(): string | undefined {
    return this.config?.defaultApiKey;
  }

  getDefaultApiUrl(): string | undefined {
    return this.config?.defaultApiUrl;
  }

  hasConfig(): boolean {
    return this.config !== null;
  }
}
