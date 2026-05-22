import { Routes } from '@angular/router';
import { CompanyFormComponent } from './components/company-form.component';
import { DocumentFormComponent } from './components/document-form.component';
import { HistoryComponent } from './components/history.component';
import { CustomerFormComponent } from './components/customer-form.component';

export const routes: Routes = [
  { path: 'company', component: CompanyFormComponent },
  { path: 'document', component: DocumentFormComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'customer', component: CustomerFormComponent },
  { path: '', redirectTo: '/history', pathMatch: 'full' }
];
