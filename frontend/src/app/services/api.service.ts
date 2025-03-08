import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, Room } from 'colyseus.js';
import { Router } from '@angular/router'; // Importez le Router
//import { GameComponent } from '../components/game/game.component';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private join = new BehaviorSubject<boolean>(true);
  join$= this.join.asObservable();
  private client: Client;
  private room: Room | undefined;
  public players: Array<{ id: string; name: string; hand: Array<{ value: string; color: string; image: string }> }> = [];
  public clientId : any;

  // Ajoutez `Router` dans le constructeur
  constructor(private router: Router) {
    // URL du backend Colyseus
    this.client = new Client('ws://localhost:2567');
  }

  // Joindre une room
  async joinRoom(roomId: string, options: any={}): Promise<void> {
    try {
      this.room = await this.client.joinById(roomId, options);
      console.log(`Connecté à la room : ${roomId}`);

      this.join.next(true);
      // Écoutez le message 'gameStart' et redirigez l'utilisateur
      this.room.onMessage('gameStart', (data) => {
        this.router.navigate(['/game', data.roomId]); // Redirige vers la page de jeu
      });

      this.clientId = this.room.sessionId;

      //Ecoute des messages de mis à jour des jouers
      this.room.onMessage('updatePlayers', (players) => {
        this.players = players; // Mettre à jour la liste des joueurs
        console.log('Liste des joueurs mise à jour :', this.players);
      });

    } catch (error) {
      console.error('Erreur lors de la connexion à la room :', error);
      this.join.next(false);
      alert('mauvais id :,)');

    }
  }

  // Créer une room
  async createRoom(roomName: string, options: any = {}): Promise<string> {
    try {
      const room: Room = await this.client.create(roomName, options);
      this.room = room; // Assurez-vous de référencer la room créée

      // Retourner immédiatement l'ID de la room
      const roomId = room.id;
      this.clientId = room.sessionId;

      // Ensuite, écoutez le message 'gameStart' pour la room nouvellement créée
      this.room.onMessage('gameStart', (data) => {
        console.log('Le jeu commence, redirection vers la page de jeu...');
        this.router.navigate(['/game', data.roomId]); // Redirige vers la page de jeu
      });

      return roomId; // Retourner l'ID immédiatement après la création de la room

    } catch (error) {
      console.error('Erreur lors de la création de la room :', error);
      throw error;
    }
  }

  // Envoyer un message
  sendMessage(type: string, message: any): void {
    if (this.room) {
      this.room.send(type, message);
    }
  }

  // Écouter les messages reçus
  onMessage(type: string, callback: (message: any) => void): void {
    if (this.room) {
      this.room.onMessage(type, callback);
    }
  }


  // Quitter la room actuelle
  leaveRoom(): void {
    if (this.room) {
      this.room.leave();
      this.router.navigate([''])
    } else {
      console.warn('Aucune room connectée. Impossible de quitter');
    }
  }

/*
  playCard(card: { color: string, value: string }): void {
    // Envoyer un message avec la carte jouée
    this.room?.send('playCard', { card });
  }*/

  playCard(message: { cardIndex: number[], selectedColor?: string }): void {
  this.room?.send('playCard', message);
}


}
