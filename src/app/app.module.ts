import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';

// import { AngularFirestoreModule } from 'angularfire2/firestore';
// import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

// Firebase setup instructions

// 1. delete this line, then...
import { firebaseConfig } from '../env'; 

// 2. Add your own firebase config to environment.ts
// 3. Use the environment to initialize angularfire2 below, like so AngularFireModule.initializeApp(environment.firebaseConfig),


import { TaskService } from './task.service'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  providers: [TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }
