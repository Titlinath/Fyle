import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { AddWorkoutComponent } from './components/add-workout/add-workout.component';
import { WorkoutService } from './services/workout.service';

@NgModule({
  declarations: [AppComponent, WorkoutListComponent, AddWorkoutComponent],
  imports: [BrowserModule],
  providers: [WorkoutService],
  bootstrap: [AppComponent],
})
export class AppModule {}
