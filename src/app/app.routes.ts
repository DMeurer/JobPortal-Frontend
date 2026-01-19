import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TimeCurveComponent } from './components/time-curve/time-curve.component';
import { JobSearchComponent } from './components/job-search/job-search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'JobPortal - Dashboard' },
  { path: 'time-curve', component: TimeCurveComponent, title: 'JobPortal - Time Curve' },
  { path: 'job-search', component: JobSearchComponent, title: 'JobPortal - Job Search' },
  { path: 'settings', component: SettingsComponent, title: 'JobPortal - Settings' },
  { path: '**', redirectTo: '' }
];
