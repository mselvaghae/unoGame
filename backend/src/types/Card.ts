import {type, Schema} from '@colyseus/schema';
export enum cardType {
  Number0,
  Number1,
  Number2,
  Number3,
  Number4,
  Number5,
  Number6,
  Number7,
  Number8,
  Number9,
  Plus2,
  Pass,
  Reverse,
  Plus4,
  Change
}
export enum cardColor{
  red,
  green,
  blue,
  yellow,
  incolor
}
export class  Card extends Schema{
    @type("number")color: cardColor;
    @type("number")value: cardType; // Can be a number (0-9), "Pass", "Reverse", "+2", "+4", "Change color"
    constructor(a_color: cardColor, a_value: cardType)
    {
      super();
      this.color = a_color;
      this.value = a_value;
    }
  }