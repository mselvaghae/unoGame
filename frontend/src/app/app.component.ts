import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'UNO Game';
  message: string[] =[]; // Liste des messages reçus
  playerName!: string;
  constructor(private apiService: ApiService) {}

  OnInit(): void {
    // Écouter les messages recus de la room
    this.apiService.onMessage('chat', (message:string)=> {
      this.message.push(message);
      console.log('message recu :', message);
    });
  }
  
  // Méthode pour envoyer un message au serveur
  sendMessage(): void {
    this.apiService.sendMessage('chat', { text: this.message, playerName:this.playerName});
    console.log('message envoyé:', this.message);
  }

  leaveRoom():void{
    this.apiService.leaveRoom();
    console.log('vous avez quitté la room.');
  }
}
