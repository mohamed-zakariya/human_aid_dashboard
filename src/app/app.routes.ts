import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home', 
        loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
      },
      { 
        path: 'words', 
        loadComponent: () => import('./pages/words/words.component').then(c => c.WordsComponent),
      },
      { 
        path: 'sentences', 
        loadComponent: () => import('./pages/sentence/sentence.component').then(c => c.SentenceComponent),
      },
      { 
        path: 'learners', 
        loadComponent: () => import('./pages/learners/learners.component').then(c => c.LearnersComponent),
      },
      { 
        path: 'guardians', 
        loadComponent: () => import('./pages/guardian-management/guardian-management.component').then(c => c.GuardianManagementComponent),
      }
      // Add more child routes here as you create components
      // { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance.component').then(c => c.AttendanceComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' } // Wildcard route for 404 page
];