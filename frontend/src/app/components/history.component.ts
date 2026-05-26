import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../services/document.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto card-panel mt-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Document History</h2>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-gray-500">Filter by Type:</label>
          <select [(ngModel)]="selectedType" (change)="loadDocuments()" class="clean-input">
            <option value="">All Documents</option>
            <option value="QUOTATION">Quotation</option>
            <option value="INVOICE">Invoice</option>
            <option value="BILL">Bill</option>
            <option value="TAX_INVOICE">Tax Invoice</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 text-left text-gray-500">
              <th class="p-3 border-b border-gray-200">Date</th>
              <th class="p-3 border-b border-gray-200">Doc Number</th>
              <th class="p-3 border-b border-gray-200">Type</th>
              <th class="p-3 border-b border-gray-200">Company</th>
              <th class="p-3 border-b border-gray-200">Customer</th>
              <th class="p-3 border-b border-gray-200 text-right">Grand Total</th>
              <th class="p-3 border-b border-gray-200 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents" class="hover:bg-pastel-light transition-colors">
              <td class="p-3 border-b border-gray-100">{{ doc.createdAt | date:'mediumDate' }}</td>
              <td class="p-3 border-b border-gray-100 font-semibold text-gray-900">{{ doc.docNumber }}</td>
              <td class="p-3 border-b border-gray-100">
                <span class="px-2 py-1 rounded text-xs font-bold" 
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': doc.type === 'INVOICE',
                        'bg-purple-100 text-purple-800': doc.type === 'QUOTATION',
                        'bg-green-100 text-green-800': doc.type === 'TAX_INVOICE',
                        'bg-yellow-100 text-yellow-800': doc.type === 'BILL'
                      }">
                  {{ doc.type }}
                </span>
              </td>
              <td class="p-3 border-b border-gray-100">{{ doc.company?.name || doc.companyNameSnapshot }}</td>
              <td class="p-3 border-b border-gray-100">{{ doc.customerName }}</td>
              <td class="p-3 border-b border-gray-100 text-right font-bold">{{ doc.grandTotal | number:'1.2-2' }}</td>
              <td class="p-3 border-b border-gray-100 text-center space-x-2">
                <button (click)="viewPdf(doc.id)" class="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold transition-all">
                  View PDF
                </button>
                <button (click)="editDocument(doc.id)" class="text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm font-bold transition-all">
                  ✏️ Edit
                </button>
              </td>
            </tr>
            <tr *ngIf="documents.length === 0">
              <td colspan="7" class="p-6 text-center text-gray-400 border-b border-gray-100">No documents found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private docService = inject(DocumentService);
  private router = inject(Router);
  
  documents: any[] = [];
  selectedType: string = '';

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.docService.getDocuments(this.selectedType).subscribe({
      next: (res) => this.documents = res,
      error: (err) => console.error('Failed to load documents', err)
    });
  }

  viewPdf(id: number) {
    this.docService.downloadPdf(id);
  }

  editDocument(id: number) {
    this.router.navigate(['/document'], { queryParams: { id } });
  }
}
