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
    <div class="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md mt-10 border">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Document History</h2>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-gray-600">Filter by Type:</label>
          <select [(ngModel)]="selectedType" (change)="loadDocuments()" class="border p-2 rounded bg-gray-50">
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
            <tr class="bg-gray-100 text-left text-gray-600">
              <th class="p-3 border">Date</th>
              <th class="p-3 border">Doc Number</th>
              <th class="p-3 border">Type</th>
              <th class="p-3 border">Company</th>
              <th class="p-3 border">Customer</th>
              <th class="p-3 border text-right">Grand Total</th>
              <th class="p-3 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents" class="hover:bg-gray-50">
              <td class="p-3 border">{{ doc.createdAt | date:'mediumDate' }}</td>
              <td class="p-3 border font-semibold text-blue-600">{{ doc.docNumber }}</td>
              <td class="p-3 border">
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
              <td class="p-3 border">{{ doc.company?.name || doc.companyNameSnapshot }}</td>
              <td class="p-3 border">{{ doc.customerName }}</td>
              <td class="p-3 border text-right font-bold">{{ doc.grandTotal | number:'1.2-2' }}</td>
              <td class="p-3 border text-center space-x-2">
                <button (click)="viewPdf(doc.id)" class="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold shadow-sm transition">
                  View PDF
                </button>
                <button (click)="editDocument(doc.id)" class="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-bold shadow-sm transition">
                  ✏️ Edit
                </button>
              </td>
            </tr>
            <tr *ngIf="documents.length === 0">
              <td colspan="7" class="p-6 text-center text-gray-500 border">No documents found.</td>
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
