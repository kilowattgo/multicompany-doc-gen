import { Routes } from '@angular/router';
import { CompanyFormComponent } from './components/company-form.component';
import { DocumentFormComponent } from './components/document-form.component';
import { HistoryComponent } from './components/history.component';

export const routes: Routes = [
  { path: 'company', component: CompanyFormComponent },
  { path: 'document', component: DocumentFormComponent },
  { path: 'history', component: HistoryComponent },
  { path: '', redirectTo: '/history', pathMatch: 'full' }
];
