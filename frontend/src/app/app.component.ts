import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen text-gray-800 flex flex-col md:flex-row">
      <!-- Mobile Header -->
      <header class="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div class="flex items-center gap-3">
          <button (click)="toggleSidebar()" class="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none">
            <span class="text-xl">☰</span>
          </button>
          <span class="text-xl font-extrabold text-gray-900 tracking-tight">Stellar DocGen</span>
        </div>
      </header>

      <!-- Sidebar Backdrop (Mobile only) -->
      <div *ngIf="isSidebarOpen" (click)="closeSidebar()" class="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"></div>

      <!-- Left Sidebar -->
      <nav [class.-translate-x-full]="!isSidebarOpen"
           [class.translate-x-0]="isSidebarOpen"
           class="w-60 fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div class="text-2xl font-extrabold text-gray-900 tracking-tight">
              Stellar<br>DocGen
            </div>
            <div class="text-xs text-gray-400 mt-1">Document Generator</div>
          </div>
          <!-- Close button for mobile -->
          <button (click)="closeSidebar()" class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <span class="text-xl">✕</span>
          </button>
        </div>

        <!-- Menu Items -->
        <div class="flex-1 flex flex-col gap-1 p-4">
          <a routerLink="/document" routerLinkActive="bg-pastel-bg text-gray-900 font-bold" (click)="closeSidebar()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">📄</span>
            <span>Issue Document</span>
          </a>
          <a routerLink="/history" routerLinkActive="bg-pastel-bg text-gray-900 font-bold" (click)="closeSidebar()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">📋</span>
            <span>History</span>
          </a>
          <a routerLink="/company" routerLinkActive="bg-pastel-bg text-gray-900 font-bold" (click)="closeSidebar()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">🏢</span>
            <span>Companies</span>
          </a>
          <a routerLink="/customer" routerLinkActive="bg-pastel-bg text-gray-900 font-bold" (click)="closeSidebar()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">👥</span>
            <span>Customers</span>
          </a>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          © 2026 Stellar DocGen
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-1 md:ml-60 p-4 md:p-6 w-full">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {
  title = 'frontend';
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
