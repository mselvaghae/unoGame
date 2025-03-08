import { Room, Client } from "@colyseus/core";
import { MyRoomState, gameState } from "./schema/MyRoomState";
import {ArraySchema} from '@colyseus/schema';
import { Card } from '../types/Card';
import { Player} from '../types/Player';
import { ChatEvent} from '../types/ChatEvent';

export class MyRoom extends Room<MyRoomState> {

  // Vérifie si un joueur à vider sa main
  checkForWinner() {
    for(let i = 0; i < this.state.players.length; ++i) {
      if(this.state.players.at(i).hand.length === 0) {
        this.state.gameState = gameState.gameover;
        this.broadcast("gameover", { winner: this.state.players.at(i) }); // Broadcasting to all clients
        break;
      }
    }
  }
  onCreate () { // constructeur de la room
    this.maxClients =4;
    this.setState(new MyRoomState());

    this.onMessage("playCard", (client, message) => {
      this.state.playCard(client, message);
    });
    this.onMessage("cardUpdate",(client)=>{
      this.state.cardUpdate(client);
    });
    this.onMessage("setMaxPlayers", (client, message) => {

      if(message.maxClients > 1 && message.maxClients < 5 && this.state.gameState == gameState.waiting) {
        this.maxClients = message.maxClients;
        }
    });
    this.onMessage("addMessage", (client, message) => {
      for(let i = 0; i < this.state.players.length; ++i)
        if(client.sessionId === this.state.players.at(i).clientID) {
          this.state.chat.push(new ChatEvent(message.content, this.state.players.at(i).name));
          console.log("Message envoyé par " + this.state.players.at(i).name + " : " + message.content);
        }
    });
    this.onMessage("playCard", (client, message) => {
      this.state.playCard(client, message);
      this.checkForWinner();
      this.broadcast("updateGameState", this.state);
    });

    this.onMessage("draw", (client) => {
      const currentPlayer = this.state.playerLookup(client.id);
      if(currentPlayer == this.state.currentPlayerIndex) {
        if(this.state.currentPenalty > 0)
        {
          while(this.state.currentPenalty > 0)
          {
            this.state.draw(currentPlayer);
            client.send("newCards", {"hand" : this.state.players.at(currentPlayer).hand});
            this.state.currentPenalty = this.state.currentPenalty - 1;
          }
        }
        else
        {
          this.state.draw(currentPlayer);
          client.send("newCards", {"hand" : this.state.players.at(currentPlayer).hand});
        }
        this.state.turnForward();
        this.checkForWinner();
      }
    });
    this.onMessage("restart", () => {
      if(this.state.gameState == gameState.gameover)
      {
        this.state.gameState = gameState.playing;
        this.state.firstCardOnDiscardPile();
        for(let i = 0; i < this.state.players.length; ++i)
        {
            this.state.players.at(i).hand.clear();
            recover_hand(this.state.players.at(i), this.state.deck);
            this.broadcast("reset");
        }
      }
    })
    this.onMessage("uno", (client) => { 
      this.state.sayUno(client);
    });
    this.onMessage("contre_uno", (client) => {
      this.state.sayContreUno(client);
    });
  }

  onJoin (client: Client, options: any) {
    if (this.state.players.length < this.maxClients) {
      
      const newPlayer = new Player( 
        options.name,
        new ArraySchema<Card>(),
        client.id
      );

      console.log("joined room", this.roomId);
      
      recover_hand(newPlayer, this.state.deck);
      //listCards(newPlayer);
      
      // add the player to the state
      this.state.players.push(newPlayer);
      console.log("JOUEUR :", newPlayer.name);

      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;

      if(this.state.players.length === this.maxClients){
        this.state.gameState = gameState.playing;
        this.broadcast("gameStart",{roomId: this.roomId});
        console.log("Game start");
      }
      this.broadcastPlayersUpdate();
    }
  }

  onLeave (client: Client) {
    /**
     * dans la fonction play, l'attribut isUp du joueur est vérifiée
     * si !isUp, la première carte jouable sera sélectionnée pour être posée sur la pile.
     */
    console.log(client.sessionId, "left!");
    const currentPlayer = this.state.playerLookup(client.id); // let to const cf lint OK?
    this.state.players.at(currentPlayer).isUp = false;
    if(this.state.currentPlayerIndex == currentPlayer)
      this.state.playCard(client, {});
  }
  onDispose() { 
    console.log("room", this.roomId, "disposing...");
  }

  private broadcastPlayersUpdate() {
    this.broadcast('updatePlayers', this.state.players.map((player, index) => ({
        id: player.clientID,
        name: player.name,
        hand: player.hand,
        isCurrent: player.clientID === this.state.players[this.state.currentPlayerIndex]?.clientID
    })));
  }

}

function recover_hand(Player: Player, deck: ArraySchema<Card>)
{
    for(let i = 0; i < 7; i++)
    {
        Player.hand.push(deck.pop());
    } 
}














/*
import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

// Définition de la classe MyRoom
export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  // Fonction pour créer un paquet de cartes
  createDeck() {
    const colors = ["blue", "green", "yellow", "red"];
    const deck = [];

    // Générer les cartes numérotées de 0 à 9
    for (const color of colors) {
      deck.push({ color, type: "number", value: 0 }); // Un seul zéro
      for (let i = 1; i <= 9; i++) {
        deck.push({ color, type: "number", value: i });
        deck.push({ color, type: "number", value: i });
      }
    }

    // Générer les cartes spéciales (+2, Reverse, Skip)
    for (const color of colors) {
      for (let i = 0; i < 2; i++) {
        deck.push({ color, type: "draw2" });
        deck.push({ color, type: "reverse" });
        deck.push({ color, type: "skip" });
      }
    }

    // Générer les cartes Joker et Joker +4
    for (let i = 0; i < 4; i++) {
      deck.push({ color: "neutral", type: "wild" });
      deck.push({ color: "neutral", type: "wild_draw4" });
    }

    // Cartes optionnelles (si utilisées)
    deck.push({ color: "neutral", type: "shuffleHands" });
    deck.push({ color: "neutral", type: "swapHands" });
    for (let i = 0; i < 3; i++) {
      deck.push({ color: "neutral", type: "customizable" });
    }

    return deck;
  }

onCreate(options: Record<string, any>) {
  this.setState(new MyRoomState());

  // Création et mélange du deck de cartes
  const deck = this.createDeck();
  const shuffledDeck = deck.sort(() => Math.random() - 0.5);

  // Envoie de l'ID de la room au client qui a créé la salle
  if (options.creatorClient) {
    const creatorClient = options.creatorClient; // Assurez-vous de passer cette info dans options lors de la création
    creatorClient.send("roomId", this.roomId); // Envoie l'ID de la room au créateur
  }

  // Afficher l'ID de la room sur le serveur pour vérifier
  console.log(`ID de la salle créée : ${this.roomId}`);
}


  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "Tu as rejoins une room");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "Tu as quitté une room!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}*/