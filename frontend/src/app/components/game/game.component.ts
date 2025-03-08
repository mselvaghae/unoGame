import { ApiService } from './../../services/api.service';
import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common'; // Import du CommonModule

@Component({
  selector: 'app-game',
  standalone: true, // Indique que ce composant est autonome
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  imports: [CommonModule], // Ajoutez CommonModule ici pour *ngFor et *ngIf
})
export class GameComponent implements OnInit {
  currentCardImage: string = './assets/8/y8.png'; // Exemple de carte actuelle
  
  Players: Array<{ id: string; name: string; hand: Array<{ value: string; color: string; image: string }> }> = [];
  currentPlayer: { id: string; name: string; hand: Array<{ value: string; color: string; image: string }> }| undefined;

  constructor(private apiService: ApiService){
    this.apiService.onMessage('updatePlayers',(players: any[])=>{
      this.Players = players.filter(player => player.id !== this.apiService.clientId); // Les autres joueurs
    this.currentPlayer = players.find(player => player.id === this.apiService.clientId); 
    
    // Sauvegarde dans localStorage
    localStorage.setItem('unoGameState', JSON.stringify({
      players: this.Players,
      currentPlayer: this.currentPlayer
    }));

    })

    // this.currentPlayer = this.apiService.players.find(player => player.id === this.apiService.clientId);
    // this.Players = this.apiService.players.filter(player => player.id !== this.apiService.clientId);
  }
  ngOnInit(): void {
    const savedState = localStorage.getItem('unoGameState');
    if (savedState) {
      const { players, currentPlayer } = JSON.parse(savedState);
      this.Players = players;
      this.currentPlayer = currentPlayer;
    }
  }
/*
  // Méthode appelée lorsqu'une carte est jouée
  playCard(card: { color: string, value: string }): void {
    this.apiService.playCard(card);
  }*/
  

  promptForColorSelection(card: { color: string, value: string }): string | undefined {
    const colors = ["red", "yellow", "green", "blue"];
    let selected: string | null = null;

    while (!selected || !colors.includes(selected.toLowerCase())) {
      selected = prompt(`Vous avez joué ${card.value}. Choisissez une couleur : rouge, jaune, vert ou bleu`);

      if (selected === null) {
        alert("Vous devez choisir une couleur pour continuer !");
      }
    }

    return selected ? selected.toLowerCase() : undefined;
  }


  playCard(card: { color: string, value: string }): void {
    if (!this.currentPlayer || !this.currentPlayer.hand) return; // Vérification si le joueur existe

    // Trouver l'index de la carte jouée dans la main du joueur
    const cardIndex = this.currentPlayer.hand.findIndex(c => c.color === card.color && c.value === card.value);

    if (cardIndex === -1) {
      console.error("Carte non trouvée dans la main du joueur");
      return;
    }

    // Vérifier si c'est une carte spéciale nécessitant une sélection de couleur
    let selectedColor: string | undefined;
    if (card.value === '13' || card.value === '14') {
      selectedColor = this.promptForColorSelection(card);
    }

    // Envoyer le message au backend via ApiService
    this.apiService.playCard({ cardIndex: [cardIndex], selectedColor });

    // Supprimer la carte jouée localement (mise à jour de l'affichage)
    this.currentPlayer.hand.splice(cardIndex, 1);
  }


  piocheCard(){
    console.log("carte piocher");
  }

  getPositionClass(i: number): string {
    switch (i) {
      case 0:
        return 'top-player';  
      case 1:
        return 'right-player'; 
      case 2:
        return 'left-player'; 
      default:
        return 'buttom-player'; 
    }
  }



  getCardImagePath(card: { color: string, value: string }): string {
    console.log(`assets/${card.value}/${card.color}.png`);
    return `assets/${card.value}/${card.color}.png`;
  }

  leaveRoom() {
    try {
      this.apiService.leaveRoom();
    }catch {
      console.error("erreur de déconnexion de la room");
    }
  }


}
