import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies`);
  }

  getDocuments(type?: string): Observable<any[]> {
    const url = type ? `${this.apiUrl}/documents?type=${type}` : `${this.apiUrl}/documents`;
    return this.http.get<any[]>(url);
  }

  createCompany(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/companies`, formData);
  }

  updateCompany(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/companies/${id}`, formData);
  }

  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers`);
  }

  createCustomer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, data);
  }

  updateCustomer(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, data);
  }

  createDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/documents`, data);
  }

  downloadPdf(docId: number) {
    this.http.get(`${this.apiUrl}/documents/${docId}/pdf`, { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      });
  }
}
