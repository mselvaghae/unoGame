import { Schema, type, ArraySchema } from '@colyseus/schema';
import { Player } from '../../types/Player';
import { Card } from '../../types/Card';
import { cardType } from '../../types/Card';
import { cardColor } from '../../types/Card';
import { Client } from "@colyseus/core";
import { ChatEvent } from '../../types/ChatEvent';

export enum gameState {
  waiting,
  playing,
  gameover
}

export class MyRoomState extends Schema
{
  deck: ArraySchema<Card> = new ArraySchema<Card>(); // pioche quand on a pas de carte

  @type([ Card ])discardPile: ArraySchema<Card> = new ArraySchema<Card>(); // ou l'on mets la carte pour joeur

  @type([ Player ])players: ArraySchema<Player> = new ArraySchema<Player>();

  @type("number")currentPenalty : number; // amount of cards to draw when +2 or +4

  @type("number")currentPlayerIndex: number;

  @type("number")gameState: gameState; // 'waiting', 'playing', 'gameover'

  @type([ChatEvent]) chat : ArraySchema<ChatEvent>;

  @type("number") selectedColor: number;

  @type("boolean") order: boolean;
  // order : boolean;
  lastCardPlayedTimestamp = new Date().valueOf();

  constructor()
  {
    super();
    this.currentPlayerIndex = 0;
    this.gameState = gameState.waiting;
    this.deck = this.createDeck();
    this.firstCardOnDiscardPile();
    this.currentPenalty = 0;
    this.chat = new ArraySchema<ChatEvent>();
    this.order = true;

  }
  turnForward()
  {
    if(this.order)
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    else
      this.currentPlayerIndex = ((this.currentPlayerIndex - 1) +this.players.length)  % this.players.length;
  }
  playerLookup (clientId : string) : number{
    for (let i = 0; i < this.players.length; ++i){
      if(this.players.at(i).clientID == clientId){ 
        return i;
      }
    }
    return -1;
  }
  isCompatible (card : Card) : boolean
  {
    /***
     * La fonction isCompatible permet de vérifier si une carte peut être placée ou non au sommet de la pile.
     */
    /*====Variables contexctuelles de l'état du jeu ==== */
    const lastCard = this.discardPile.at(this.discardPile.length - 1);
    const lastCardIncolor = (lastCard.color == cardColor.incolor);
    const lastCardSameColor = lastCard.color ==card.color;
    const lastCardSameCardType = lastCard.value == card.value;
    const currentCardIncolor = card.color == cardColor.incolor;
    const Plus2ToACK = lastCard.value==cardType.Plus2 && this.currentPenalty > 0;
    const Plus4ToACK = lastCard.value==cardType.Plus4 && this.currentPenalty > 0;
    const Plus2ACKed = (!Plus2ToACK) || (Plus2ToACK && card.value == cardType.Plus2);
    const Plus4ACKed = (!Plus4ToACK) || (Plus4ToACK && card.value == cardType.Plus4);
    /*====Variables contexctuelles de l'état du jeu ==== */
    return ((lastCardIncolor || lastCardSameColor || lastCardSameCardType || currentCardIncolor) &&  Plus2ACKed && Plus4ACKed)
  }
  canPlay(clientId : number) : number
  {
    /** La fonction canPlay vérifie si le joueur est capable de jouer avec sa main courante.
     * Cette fonction permet de throw l'action 'piocher' lorsque le joueur ne dispose d'aucune carte compatible.
     * Cette fonction dispose donc d'une référence dans la fonction @playCard (à la fin) afin de provoquer l'action 'piocher' 
     * au début du tour pour le joueur du tour courant, comme la première carte compatible sera automatiquement jouée.,
     * le joueur courant ne dispose d'aucun moyen d'effectuer son tour, 
     * 
     * (Cette fonction retourne -1 si aucune carte n'est compatible, et l'indice de la carte sinon)
     */
    const currentPlayer = this.players.at(clientId);
    for (let i = 0; i < currentPlayer.hand.length; ++i){
      if(this.isCompatible(currentPlayer.hand.at(i)))
        return i;
    }
    return -1;
  }
  shuffleDeck() {
    /**
     * Mélange du deck, place durant 1000 itérations la première carte du deck à une position aléatoire dans le deck.
     */
    for (let i = 0; i < 1000; ++i) {
      const randomIndex = Math.floor(Math.random() * (this.deck.length));
      const temp = new Card(this.deck.at(randomIndex).color, this.deck.at(randomIndex).value);
      this.deck.splice(randomIndex, 1);
      this.deck.push(temp);
    }
  }
proceedTurn(player : Player, cardIndex : ArraySchema<number>, selectedColorParam : number){
    /*Nous avons l'assurance que la carte est valide, il suffit de la
    * pousser sur la pile, et d'appliquer son effet.
    */
    this.lastCardPlayedTimestamp =  new Date().valueOf()
    let lastCardAfterPlaying : Card;
    for(let i = 0; i < cardIndex.length; ++i)
    {

      if (player.hand.at(cardIndex[i]).value == cardType.Plus4 || player.hand.at(cardIndex[i]).value == cardType.Change)
      {
        this.selectedColor = selectedColorParam;
        this.discardPile.push(new Card(selectedColorParam, player.hand.at(cardIndex[i]).value));
      }
      else
        this.discardPile.push(new Card(player.hand.at(cardIndex[i]).color, player.hand.at(cardIndex[i]).value));
      lastCardAfterPlaying = this.discardPile.at(this.discardPile.length - 1)
      player.hand.splice(cardIndex[i], 1);
      if(lastCardAfterPlaying.value == cardType.Plus2)
        this.currentPenalty = this.currentPenalty + 2;
      else if(lastCardAfterPlaying.value == cardType.Plus4)
        this.currentPenalty = this.currentPenalty + 4;
      else if(lastCardAfterPlaying.value == cardType.Pass)
      {
        if(this.order)
          this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        else
          this.currentPlayerIndex = (this.currentPlayerIndex - 1) % this.players.length;
      }
      else if(lastCardAfterPlaying.value == cardType.Reverse)
        this.order = !this.order;
      for(let j = i; j < cardIndex.length; ++j)
        cardIndex[j] = cardIndex[j] - 1;
        player.numberCard = player.hand.length;
    }
  }
  draw(clientId : number) {
    this.players.at(clientId).hand.push(this.deck.pop());     
    this.players.at(clientId).numberCard = this.players.at(clientId).hand.length;
    if(this.deck.length <= 0)
      this.rebuildDeck();
  }
  cardUpdate(client : Client){
    const i = this.playerLookup(client.id);
    client.send("newCards", {"hand" : this.players.at(i).hand});
  }
  playCard(client : Client, message : any)
  {
    /**
     * La fonction playCard est composée de plusieures partie 1 : 
     * 1/ Recherche de l'instance du joueur via la chaîne de caractère clientID
     * 2/ Vérification de la possibilité pour le joueur de jouer une carte.
     */
    
    if(this.gameState == gameState.playing)
    {
      const i = this.playerLookup(client.id);

      
      if(this.currentPlayerIndex == i){ 
        const currentPlayer = this.players.at(i);
        let validHand = true;
        for (let j = 0; j < message.cardIndex.length && message.cardIndex.length > 0; ++j)
        {
          if((currentPlayer.hand.at(message.cardIndex[j]).color != currentPlayer.hand.at(message.cardIndex[0]).color) || 
          (currentPlayer.hand.at(message.cardIndex[j]).value != currentPlayer.hand.at(message.cardIndex[0]).value) || 
          (currentPlayer.hand.at(message.cardIndex[j]).value > cardType.Plus2 && message.cardIndex.length > 1))
          validHand = false;
        }
        if(this.isCompatible(currentPlayer.hand.at(message.cardIndex[0])) && validHand && message.cardIndex.length > 0)
        {
          this.proceedTurn(currentPlayer, message.cardIndex, message.selectedColor);
          this.turnForward();
          // si le prochain ne peut pas jouer, pioche automatique + changement de joueur
          const lastCardAfterPlaying = this.discardPile.at(this.discardPile.length - 1)
          if(this.canPlay(this.currentPlayerIndex) == -1 && ((lastCardAfterPlaying.value == cardType.Plus2) || (lastCardAfterPlaying.value == cardType.Plus4)))
          {
              this.chat.push(new ChatEvent(this.players.at(this.currentPlayerIndex).name + " Cant respond !", "System"));
              this.draw(this.currentPlayerIndex);
              for(let j = 0; j < this.currentPenalty-1; ++j)
              {
                this.draw(this.currentPlayerIndex);
              }
              this.currentPenalty = 0;
              this.turnForward();
          }
        }
        /* pioche si besoin & changement de joueur*/
        client.send("newCards", {"hand" : currentPlayer.hand});
        if(currentPlayer.hand.length == 0)
        {
          this.chat.push(new ChatEvent(currentPlayer.name + " won !", "System"));
          this.gameState = gameState.gameover;
        }
      }

      /*remet le say uno a false s'il a 2 cartes*/
      if (this.players.at(i).hand.length > 1)
      {
        this.players.at(i).sayUno = false;
      }
    }
  }
  createDeck(){
    /**
     * @createDeck permet de générer le deck initial par une itération sur les deux énumérations (de type, et de couleur),
     * balayant tout le spectre de cartes existantes tout en filtrant les cartes à conserver et à ajouter à l'instance
     * du deck, matérialisée par un conteneur.
     */
    for(let cardTypeIndex = 0; cardTypeIndex < cardType.Change + 1; ++cardTypeIndex)
    {
      for(let cardColorIndex = 0; cardColorIndex < cardColor.incolor + 1; ++cardColorIndex)
      {
        const card =  new Card  (
          cardColorIndex,
          cardTypeIndex
        );
        if(cardColorIndex != cardColor.incolor)
        {
          if(cardTypeIndex < cardType.Plus4)
          {this.deck.push(card);
          this.deck.push(card);}
        }
        else
        {
          if(cardTypeIndex >= cardType.Plus4)
          {
            {this.deck.push(card)
            this.deck.push(card)}
          }
        }
      }
    }
    this.shuffleDeck();
    return this.deck;
  }
  rebuildDeck() {
    /**
     * @rebuildDeck permet la mise à jour du deck en cas de 'deck out', le programme fait référence à cette fonction après chaque
     * itération de pioche afin de s'assurer que le deck dispose forcément d'au moins  une carte.
     */
    if (this.discardPile.length > 0) {
      // Ajoutez toutes les cartes de la défausse, sauf la dernière, au deck
      for (let i = 0; i < this.discardPile.length - 1; i++) {
        this.deck.push(this.discardPile[i]);
      }

      // Supprimez les cartes ajoutées de la défausse
      this.discardPile.splice(0, this.discardPile.length - 1);

      // Mélangez le deck
      this.shuffleDeck();
    }
    console.log("reconstruction du deck");
  }

  sayUno(client : Client) {
      const i = this.playerLookup(client.id);

      if(this.players.at(i).hand.length == 1 && this.players.at(i).sayUno == false) {
        this.players.at(i).sayUno = true;
        this.chat.push(new ChatEvent(this.players.at(i).name + " said Uno !", "System"));
      }
      else if (this.players.at(i).hand.length != 1 ) // evite de mettre un +2 quand on a plus qu'une carte mais qu'il a deja cliqué sur uno
      {
        this.players.at(i).sayUno = false;
        this.draw(i);
        this.draw(i);
      }
  }

  sayContreUno(client : Client) {
    if(new Date().valueOf() - this.lastCardPlayedTimestamp > 2000)
    {
      const i = this.playerLookup(client.id);

      for(let j=0; j<this.players.length ; ++j) {
      
        if (this.players.at(j).hand.length == 1 &&
          this.players.at(j).sayUno      == false  && 
          i != j) {
        this.draw(j);
        this.draw(j);
        this.chat.push(new ChatEvent(this.players.at(j).name + " contre uno by " + this.players.at(i).name, "System"));
      }
      }
    }
    else
    {
      const i = this.playerLookup(client.id);
      this.chat.push(new ChatEvent("Contre UNO too fast ! (wait 2 sec)", this.players.at(i).name));
    }
  }

  firstCardOnDiscardPile() {
    while (this.discardPile.length == 0) {
      const card = this.deck.shift(); // Récupère et retire la première carte du deck

      if (
        card &&
        (card.value  === cardType.Number1 ||
          card.value === cardType.Number2 ||
          card.value === cardType.Number3 ||
          card.value === cardType.Number4 ||
          card.value === cardType.Number5 ||
          card.value === cardType.Number6 ||
          card.value === cardType.Number7 ||
          card.value === cardType.Number8 ||
          card.value === cardType.Number9)
      ) {
        this.discardPile.push(card);
        break; // Sort de la boucle une fois qu'une carte valide est trouvée
      } else {
        this.deck.push(card);
      }
    }
  }
}
