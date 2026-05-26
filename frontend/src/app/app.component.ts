import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen text-gray-800 flex">
      <!-- Left Sidebar -->
      <nav class="w-60 fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-100">
          <div class="text-2xl font-extrabold text-gray-900 tracking-tight">
            Stellar<br>DocGen
          </div>
          <div class="text-xs text-gray-400 mt-1">Document Generator</div>
        </div>

        <!-- Menu Items -->
        <div class="flex-1 flex flex-col gap-1 p-4">
          <a routerLink="/document" routerLinkActive="bg-pastel-bg text-gray-900 font-bold"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">📄</span>
            <span>Issue Document</span>
          </a>
          <a routerLink="/history" routerLinkActive="bg-pastel-bg text-gray-900 font-bold"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">📋</span>
            <span>History</span>
          </a>
          <a routerLink="/company" routerLinkActive="bg-pastel-bg text-gray-900 font-bold"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all">
            <span class="text-lg">🏢</span>
            <span>Companies</span>
          </a>
          <a routerLink="/customer" routerLinkActive="bg-pastel-bg text-gray-900 font-bold"
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
      <div class="flex-1 ml-60 p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {
  title = 'frontend';
}
