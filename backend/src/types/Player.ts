import {ArraySchema, Schema, type} from '@colyseus/schema';
import { cardType } from '../types/Card';
import { cardColor } from '../types/Card';
import { Card } from './Card';
export class  Player  extends Schema {
  
  @type("string") name       : string;
  @type("string") clientID   : string;
  @type("number") numberCard : number; 
  @type("boolean") isUp : boolean;
  @type("boolean") sayUno : boolean = false;

  
  hand: ArraySchema<Card>;
  
  constructor(a_name: string, a_hand : ArraySchema<Card>, a_clientID : string)
  {
    super();
    this.name       = a_name;
    this.hand       = a_hand;
    this.clientID   = a_clientID;
    this.numberCard = 7;
    this.isUp = true;
  }
}

export function listCards(player : Player)
{
  console.log("Cartes de " + player.name)
  for(let i=0; i<player.hand.length; ++i){
    console.log(cardType[player.hand.at(i).value] + " de couleur " + cardColor[player.hand.at(i).color]);
}
}