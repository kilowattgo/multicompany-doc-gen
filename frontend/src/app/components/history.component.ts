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
    <div class="p-6 max-w-6xl mx-auto glass-panel mt-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold gradient-text">Document History</h2>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-bold text-gray-400">Filter by Type:</label>
          <select [(ngModel)]="selectedType" (change)="loadDocuments()" class="glass-input">
            <option value="" class="bg-gray-900">All Documents</option>
            <option value="QUOTATION" class="bg-gray-900">Quotation</option>
            <option value="INVOICE" class="bg-gray-900">Invoice</option>
            <option value="BILL" class="bg-gray-900">Bill</option>
            <option value="TAX_INVOICE" class="bg-gray-900">Tax Invoice</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-white/5 text-left text-gray-400">
              <th class="p-3 border-b border-white/10">Date</th>
              <th class="p-3 border-b border-white/10">Doc Number</th>
              <th class="p-3 border-b border-white/10">Type</th>
              <th class="p-3 border-b border-white/10">Company</th>
              <th class="p-3 border-b border-white/10">Customer</th>
              <th class="p-3 border-b border-white/10 text-right">Grand Total</th>
              <th class="p-3 border-b border-white/10 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents" class="hover:bg-white/5 transition-colors">
              <td class="p-3 border-b border-white/10">{{ doc.createdAt | date:'mediumDate' }}</td>
              <td class="p-3 border-b border-white/10 font-semibold text-cosmic-blue">{{ doc.docNumber }}</td>
              <td class="p-3 border-b border-white/10">
                <span class="px-2 py-1 rounded-full text-xs font-bold" 
                      [ngClass]="{
                        'bg-blue-500/20 text-blue-300': doc.type === 'INVOICE',
                        'bg-purple-500/20 text-purple-300': doc.type === 'QUOTATION',
                        'bg-green-500/20 text-green-300': doc.type === 'TAX_INVOICE',
                        'bg-yellow-500/20 text-yellow-300': doc.type === 'BILL'
                      }">
                  {{ doc.type }}
                </span>
              </td>
              <td class="p-3 border-b border-white/10">{{ doc.company?.name || doc.companyNameSnapshot }}</td>
              <td class="p-3 border-b border-white/10">{{ doc.customerName }}</td>
              <td class="p-3 border-b border-white/10 text-right font-bold">{{ doc.grandTotal | number:'1.2-2' }}</td>
              <td class="p-3 border-b border-white/10 text-center space-x-2">
                <button (click)="viewPdf(doc.id)" class="text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:shadow-red-500/20 px-3 py-1 rounded-full text-sm font-bold transition-all">
                  View PDF
                </button>
                <button (click)="editDocument(doc.id)" class="text-white bg-gradient-to-r from-cosmic-blue to-cosmic-purple hover:shadow-lg hover:shadow-cosmic-purple/20 px-3 py-1 rounded-full text-sm font-bold transition-all">
                  ✏️ Edit
                </button>
              </td>
            </tr>
            <tr *ngIf="documents.length === 0">
              <td colspan="7" class="p-6 text-center text-gray-500 border-b border-white/10">No documents found. ✨</td>
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
