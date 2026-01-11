import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  apiKey: string = '';
  apiUrl: string = '';
  saved = false;
  testing = false;
  testResult: { success: boolean; message: string } | null = null;
  hasEnvironmentKey = false;
  usingCustomKey = false;

  constructor(
    private settingsService: SettingsService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.checkEnvironmentKey();
  }

  loadSettings(): void {
    const settings = this.settingsService.getSettings();
    this.apiKey = settings.apiKey || '';
    this.apiUrl = settings.apiUrl;
  }

  checkEnvironmentKey(): void {
    const envKey = this.settingsService.getEnvironmentApiKey();
    this.hasEnvironmentKey = !!envKey;
    this.usingCustomKey = this.settingsService.hasCustomApiKey();
  }

  saveSettings(): void {
    const settings: AppSettings = {
      apiKey: this.apiKey || undefined,
      apiUrl: this.apiUrl
    };

    this.settingsService.saveSettings(settings);
    this.checkEnvironmentKey(); // Update environment key status
    this.saved = true;

    setTimeout(() => {
      this.saved = false;
    }, 3000);
  }

  testConnection(): void {
    this.testing = true;
    this.testResult = null;

    this.apiService.testConnection().subscribe({
      next: () => {
        this.testResult = {
          success: true,
          message: 'Connection successful!'
        };
        this.testing = false;
      },
      error: (error) => {
        this.testResult = {
          success: false,
          message: `Connection failed: ${error.message}`
        };
        this.testing = false;
      }
    });
  }

  clearSettings(): void {
    if (confirm('Are you sure you want to clear all settings?')) {
      this.settingsService.clearSettings();
      this.loadSettings();
      this.checkEnvironmentKey(); // Update environment key status
      this.testResult = null;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
