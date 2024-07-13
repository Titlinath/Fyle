import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { AddWorkoutComponent } from './components/add-workout/add-workout.component';

const routes: Routes = [
  { path: '', redirectTo: '/workouts', pathMatch: 'full' },
  { path: 'workouts', component: WorkoutListComponent },
  { path: 'add-workout', component: AddWorkoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
