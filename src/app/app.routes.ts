import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TimeCurveComponent } from './components/time-curve/time-curve.component';
import { JobSearchComponent } from './components/job-search/job-search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'time-curve', component: TimeCurveComponent },
  { path: 'job-search', component: JobSearchComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
