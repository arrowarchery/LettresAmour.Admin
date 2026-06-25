import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

interface LettreDashboard {
  id: string;
  titre: string;
  contenu: string;
  dateEnvoi: string;
  isLu: boolean;
  statut: string;
  contenuReponse?: string; 
  reponduLe?: string;
}

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
  providers: [NzMessageService],
  templateUrl: './app.html'
})
export class App implements OnInit {
  lettre = { titre: '', contenu: '', dateEnvoi: null as Date | null };
  isSending = false;
  historiqueLettres: LettreDashboard[] = [];
  lettreSelectionnee: LettreDashboard | null = null;
  
  private apiUrl = 'https://lettresamour-api.onrender.com/api/lettres'; 

  constructor(private http: HttpClient, private message: NzMessageService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerHistorique();
  }

  get isFormInvalid(): boolean {
    return !this.lettre.titre?.trim() || !this.lettre.contenu?.trim() || !this.lettre.dateEnvoi;
  }

  programmerPourMaintenant() {
    this.lettre.dateEnvoi = new Date();
    this.message.info('📅 Date réglée sur "Immédiat"', { nzDuration: 2500 });
  }

  chargerHistorique() {
    this.http.get<any>(`${this.apiUrl}/admin`).subscribe({
      next: (data) => {
        console.log("🔥 DONNÉES REÇUES DU BACK :", data);
        const tableauLettres = Array.isArray(data) ? data : (data.lettres || data.value || []);
        
        this.historiqueLettres = [...tableauLettres];
        this.lettreSelectionnee = null;

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("❌ ERREUR HTTP :", err);
      }
    });
  }

  selectionnerLettre(l: LettreDashboard) {
    this.lettreSelectionnee = this.lettreSelectionnee?.id === l.id ? null : l;
    this.cdr.detectChanges(); 
  }

  envoyerLettre() {
    if (this.isFormInvalid) return;
    this.isSending = true;

    this.http.post(this.apiUrl, this.lettre).subscribe({
      next: () => {
        this.message.success('La lettre a bien été enregistrée ! ✨', { nzDuration: 4000 });
        
        setTimeout(() => {
          this.lettre = { titre: '', contenu: '', dateEnvoi: null };
          this.isSending = false;
          
          this.chargerHistorique();
          
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => {
        this.message.error("❌ Erreur lors de l'envoi.");
        this.isSending = false;
        this.cdr.detectChanges();
      }
    });
  }
}