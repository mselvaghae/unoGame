import { routes } from './app.routes';
import { NgModule } from "@angular/core";
import { HomeComponent } from "./components/home/home.component";
import { CardComponent } from "./components/card/card.component";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";


@NgModule({
    declarations:[

    ],
    imports:[
        BrowserModule,
        RouterModule.forRoot(routes),
        AppComponent,
        HomeComponent,
        CardComponent
    ],
    bootstrap:[],
})
export class AppModule{}