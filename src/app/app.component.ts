import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

import { TaskService } from './task.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public task: TaskService, public db: AngularFireDatabase) { }

  ngOnInit() { }

  perform() {
    this.task.performIn( minutes(2),  'testWorker' );

    const time = new Date('04/24/2018 11:30 AM').getTime();
    
    this.task.performAt(time,  'testWorker');

    // // Start task now, then repeat every 5 mins
    this.task.performPeriodic('taskID', Date.now(), minutes(1), 'testWorker' );
  }

}

/// TIME Helpers

function minutes(v: number) {
   return v * 60 * 1000;
}
