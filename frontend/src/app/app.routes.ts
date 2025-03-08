import { RouterModule, Routes } from '@angular/router';
//import { CardComponent } from './components/card/card.component';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    //{path:'jeu', component: CardComponent},
    { path: '', component: HomeComponent },
    { path: 'game/:roomId', component: GameComponent }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }