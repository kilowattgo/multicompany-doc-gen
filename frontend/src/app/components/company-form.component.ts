import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 mt-10 border">
      <h2 class="text-xl font-bold text-gray-800">Register Company</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        
        <div>
          <label class="block text-sm text-gray-600 mb-1">Company Name</label>
          <input type="text" formControlName="name" class="w-full border p-2 rounded">
        </div>
        
        <div>
          <label class="block text-sm text-gray-600 mb-1">Address</label>
          <textarea formControlName="address" class="w-full border p-2 rounded"></textarea>
        </div>
        
        <div>
          <label class="block text-sm text-gray-600 mb-1">Tax ID</label>
          <input type="text" formControlName="taxId" class="w-full border p-2 rounded">
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Company Logo</label>
          <input type="file" (change)="onFileSelect($event)" accept="image/*" class="w-full border p-2 rounded">
        </div>

        <button type="submit" [disabled]="form.invalid" class="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 mt-4">Save Company</button>
      </form>
    </div>
  `
})
export class CompanyFormComponent {
  private fb = inject(FormBuilder);
  private docService = inject(DocumentService);
  
  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    taxId: ['', Validators.required],
  });
  selectedFile: File | null = null;

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    fd.append('name', this.form.value.name!);
    fd.append('address', this.form.value.address!);
    fd.append('taxId', this.form.value.taxId!);
    if (this.selectedFile) fd.append('logo', this.selectedFile);

    this.docService.createCompany(fd).subscribe({
      next: () => {
        alert('Company created successfully!');
        this.form.reset();
        this.selectedFile = null;
      },
      error: (err) => console.error(err)
    });
  }
}
