import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-blue-600 text-white p-4 shadow-md">
        <div class="max-w-6xl mx-auto flex gap-6 font-bold items-center">
          <div class="text-xl mr-4 flex items-center">
            📄 DocGen
          </div>
          <div class="flex gap-4">
          <a routerLink="/document" routerLinkActive="text-white" class="text-blue-200 hover:text-white font-semibold">Issue Document</a>
          <a routerLink="/history" routerLinkActive="text-white" class="text-blue-200 hover:text-white font-semibold">History</a>
          <a routerLink="/company" routerLinkActive="text-white" class="text-blue-200 hover:text-white font-semibold">Companies</a>
          <a routerLink="/customer" routerLinkActive="text-white" class="text-blue-200 hover:text-white font-semibold">Customers</a>
          </div>
        </div>
      </nav>
      
      <div class="p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {
  title = 'frontend';
}
