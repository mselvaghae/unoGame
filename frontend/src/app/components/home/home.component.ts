import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  playerName!: string;
  idRoom:string | undefined;
  showInputField!:string;
  roomId!: string;
  message: string[]=[];
  create:  boolean | undefined ;
  join:  boolean | false = false ;
  coeur: boolean | undefined ;

  private subscription: Subscription | undefined;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    // Écouter les messages recus de la room
    this.apiService.onMessage('chat', (message:string)=> {
      this.message.push(message);
      console.log('message recu :', message);
    });
  }

  // Méthode pour rejoindre une room
  joinRoom(playerName: string): void {
    try {
      this.apiService.joinRoom(this.roomId, {name: playerName} );
      console.log('connexion réussie à la room');
    } catch {
      console.error('erreur lors de la connexion à la room');
    }
    this.subscription=this.apiService.join$.subscribe(
      (valeur) => {
        this.join= valeur;
      }
    );
  }
  //methode pour creer une room
  createRoom(playerName: string): void {
    try {
      this.apiService.createRoom('my_room', {name: playerName} ).then (roomId => {
        this.idRoom=roomId;
        console.log("Room créée avec ID :", this.idRoom);
      });
      console.log('la room elle est crée')
      

    }catch {
      console.error('impossible de creer la room')
    }
    this.create=true;
  }

  copyToClipboard(): void {
    const inputElement = document.getElementById('roomIdInput') as HTMLInputElement;
  
    if (inputElement) {
      // Sélectionner le texte dans le champ de saisie
      inputElement.select();
      inputElement.setSelectionRange(0, 99999);  // Pour mobile
  
      // Tenter de copier le texte sélectionné dans le presse-papiers
      try {
        // Utilisation de document.execCommand pour copier
        const successful = document.execCommand('copy');
        if (successful) {
          alert('ID copié dans le presse-papiers !');
        } else {
          console.error('Échec de la copie de l\'ID');
          alert('Impossible de copier l\'ID');
        }
      } catch (err) {
        console.error('Erreur lors de la copie de l\'ID :', err);
        alert('Impossible de copier l\'ID');
      }
    } else {
      console.warn('Aucun champ d\'ID trouvé');
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    
  }
  
}
