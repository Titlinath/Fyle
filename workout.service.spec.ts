import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private workouts = [
    { id: 1, name: 'John Doe', type: 'Running', minutes: 30 },
    { id: 2, name: 'Jane Smith', type: 'Cycling', minutes: 45 },
    { id: 3, name: 'Bob Johnson', type: 'Yoga', minutes: 60 },
  ];

  getWorkouts() {
    return this.workouts;
  }

  addWorkout(workout: any) {
    this.workouts.push(workout);
  }
}
