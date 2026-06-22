import { Component, OnInit } from '@angular/core';
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
  statut: number; // 0 = Brouillon, 1 = Programme, 2 = Envoye
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
  lettre = {
    titre: '',
    contenu: '',
    dateEnvoi: null as Date | null
  };

  isSending = false;
  historiqueLettres: LettreDashboard[] = [];
  lettreSelectionnee: LettreDashboard | null = null;
  
  private apiUrl = 'https://lettres-amour-api-marine.fly.dev/api/lettres'; 

  constructor(private http: HttpClient, private message: NzMessageService) {}

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
    this.http.get<any>('https://lettres-amour-api-marine.fly.dev/api/lettres/admin').subscribe({
      next: (data) => {
        console.log("🔥 DONNÉES REÇUES DU BACK :", data);
        
        // Sécurité : Si FastEndpoints a encapsulé le tableau dans une propriété, on la récupère, sinon on prend data directement
        const tableauLettres = Array.isArray(data) ? data : (data.lettres || data.value || []);
        
        // On réassigne une nouvelle référence propre pour réveiller le *ngFor d'Angular
        this.historiqueLettres = [...tableauLettres];
        
        console.log("📊 Variable historiqueLettres mise à jour :", this.historiqueLettres);
      },
      error: (err) => {
        console.error("❌ ERREUR HTTP :", err);
      }
    });
  }

  selectionnerLettre(l: LettreDashboard) {
    if (this.lettreSelectionnee?.id === l.id) {
      this.lettreSelectionnee = null;
    } else {
      this.lettreSelectionnee = l;
    }
  }

  envoyerLettre() {
    if (this.isFormInvalid) return;

    this.isSending = true;

    this.http.post(this.apiUrl, this.lettre).subscribe({
      next: () => {
        this.message.success('La lettre a bien été enregistrée et planifiée ! ✨', { nzDuration: 4000 });
        this.lettre = { titre: '', contenu: '', dateEnvoi: null };
        this.isSending = false;
        this.chargerHistorique();
      },
      error: (err) => {
        console.error(err);
        this.message.error("❌ Erreur lors de l'envoi au serveur Fly.io.");
        this.isSending = false;
      }
    });
  }
}