import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/user';
import { map } from 'rxjs';
import { ChildActivationEnd } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private userService: UsersService) {
    this.crearFormulario();
  }

  id_user: string = "";

  formulario!: FormGroup;

  ngOnInit(): void {
    this.userService.isLogged();
    
    this.userService.userSubject
    .pipe(map((p:IUser) => {return {
      id: p.id, 
      username: p.username, 
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      website: p.website,
      email: p.email
    }}))
    .subscribe((profile) => {
      this.formulario.setValue(profile);
      console.log(profile);
      this.id_user = profile.id;
      console.log(this.id_user);
    });

    


   
    
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.formulario.patchValue({ avatar_url: reader.result });
        this.formulario.get('avatar_url')?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
  }

  crearFormulario() {
    this.formulario = this.formBuilder.group({
      id: [''],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('.*[a-zA-Z].*'),
        ],
      ],
      full_name: [''],
      avatar_url: [''],
      website: ['', websiteValidator('http.*')],
      email: ['']
    });
  }

  get usernameNoValid() {
    return (
      this.formulario.get('username')!.invalid &&
      this.formulario.get('username')!.touched
    );
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.userService.setProfile(this.formulario);
    }  
  }

}
function websiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);

      return regexp.test(c.value) ? null : { website: c.value };
    }
    return null;
  };


}
