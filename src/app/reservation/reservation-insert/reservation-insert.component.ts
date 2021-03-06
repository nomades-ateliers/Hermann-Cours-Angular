import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ReservationService } from './../../service/reservation.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Plugins } from '@capacitor/core';
const { Toast } = Plugins;

@Component({
  selector: 'app-reservation-insert',
  templateUrl: './reservation-insert.component.html',
  styleUrls: ['./reservation-insert.component.css']
})
export class ReservationInsertComponent implements OnInit, OnDestroy {

  public reservationForm: FormGroup;
  message = '';
  user;
  result;
  personalSpace;
  sub;

  constructor(private fb: FormBuilder, route: ActivatedRoute, private reservationService : ReservationService, private router: Router, private afAuth: AngularFireAuth) { }

  ngOnInit(): void {
    this.reservationForm = this.fb.group({
      /*name: ['', Validators.required],*/
      type: ['', Validators.required],
      employe: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required],
    });

    this.sub = this.afAuth.authState.subscribe((user) => { //etat actuel utilisateur connecté
      console.log('user', user);

      this.user = user;
      if (this.user) {
        // console.log(this.db.readPersonalSpaceByUID(user.uid));

        this.reservationService.readPersonalReservationByUID(user.uid).subscribe(
          (data) => {
            console.log('ngOnInt readPersonnalSpaceById / data', data);
            this.personalSpace = data;
            if (!data || data.length === 0) {
              console.log(`Creating a new space for ${user.displayName}`);
              //this.reservationService.createReservationWithUID(this.user);
              this.reservationService.createReservationWithUID(this.personalSpace);
            }
          },
          (err) => {
            console.error('readPersonalSpaceById error', err);
          }
        );
      }
    });
  }

  async onInsertReservation() { 
    console.log('Coucou :', this.user.displayName);
    const result = await this.reservationService.createReservation(
      //this.reservationForm.value.name,
      this.user.displayName,
      this.reservationForm.value.type,
      this.reservationForm.value.employe,
      this.reservationForm.value.date,
      this.reservationForm.value.heure,
      this.user.uid
      
      /*if( this.result && this.result.user) {
        const userCreated = await this.userService.createUser(this.result.user);
        console.log('userCreated', userCreated);
        this.result = null;
      }*/
    );

    console.log('result', result);
    
    await Toast.show({ //si problème -> Stackoverflow 
      text: 'Insertion effectué avec succès!'
    });

    this.reservationForm.reset();
    this.router.navigate(['/personalreservation']);
  }

   // Question NGDestroy ? supprimer ou pas ? This methods run when Angular destroy a component (cf component life cycle)
  ngOnDestroy() {
    this.sub.unsubscribe() // We unsubscribe from the observable
  }

}
