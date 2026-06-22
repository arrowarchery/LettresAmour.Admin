import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message'; // 🚀 Service pur

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NzInputModule, 
    NzDatePickerModule, 
    NzButtonModule
  ],
  providers: [NzMessageService], // Injecté ici proprement
  templateUrl: './app.html'
})
export class App {
  lettre = {
    titre: '',
    contenu: '',
    dateEnvoi: null as Date | null
  };

  isSending = false;
  private apiUrl = 'https://lettres-amour-api-marine.fly.dev/api/lettres'; 

  constructor(private http: HttpClient, private message: NzMessageService) {}

  get isFormInvalid(): boolean {
    return !this.lettre.titre?.trim() || !this.lettre.contenu?.trim() || !this.lettre.dateEnvoi;
  }

  programmerPourMaintenant() {
    this.lettre.dateEnvoi = new Date();
    this.message.info('📅 Date réglée sur "Immédiat"', { nzDuration: 2500 });
  }

  envoyerLettre() {
    if (this.isFormInvalid) return;

    this.isSending = true;

    this.http.post(this.apiUrl, this.lettre).subscribe({
      next: (response: any) => {
        // Déclenche le joli toast natif
        this.message.success('La lettre a bien été prise en compte ! ✨', { nzDuration: 4000 });
        
        setTimeout(() => {
          this.lettre = { titre: '', contenu: '', dateEnvoi: null };
          this.isSending = false;
        }, 0);
      },
      error: (err) => {
        console.error(err);
        this.message.error("❌ Erreur lors de l'envoi au serveur Fly.io.");
        this.isSending = false;
      }
    });
  }
}