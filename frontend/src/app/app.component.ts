import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen text-gray-100">
      <nav class="bg-black/30 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex gap-6 font-bold items-center">
          <div class="text-2xl mr-4 flex items-center tracking-tight font-extrabold gradient-text">
            Stellar DocGen
          </div>
          <div class="flex gap-6 items-center">
            <a routerLink="/document" routerLinkActive="text-white border-b-2 border-cosmic-purple" class="text-gray-400 hover:text-white font-semibold transition-colors py-1">Issue Document</a>
            <a routerLink="/history" routerLinkActive="text-white border-b-2 border-cosmic-purple" class="text-gray-400 hover:text-white font-semibold transition-colors py-1">History</a>
            <a routerLink="/company" routerLinkActive="text-white border-b-2 border-cosmic-purple" class="text-gray-400 hover:text-white font-semibold transition-colors py-1">Companies</a>
            <a routerLink="/customer" routerLinkActive="text-white border-b-2 border-cosmic-purple" class="text-gray-400 hover:text-white font-semibold transition-colors py-1">Customers</a>
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
