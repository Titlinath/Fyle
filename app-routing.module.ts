import { Routes } from '@angular/router';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { AddWorkoutComponent } from './components/add-workout/add-workout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/workouts', pathMatch: 'full' },
  { path: 'workouts', component: WorkoutListComponent },
  { path: 'add-workout', component: AddWorkoutComponent }
];
