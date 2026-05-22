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
          <a routerLink="/history" routerLinkActive="underline" class="hover:text-blue-200">History</a>
          <a routerLink="/document" routerLinkActive="underline" class="hover:text-blue-200">Issue Document</a>
          <a routerLink="/company" routerLinkActive="underline" class="hover:text-blue-200">Add Company</a>
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
