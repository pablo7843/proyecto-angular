import { Injectable,  } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { Observable, Subject, from, tap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';

const emptyUser: IUser = {id: '0', avatar_url: 'assets/logo.svg', full_name: 'none', username: 'none', email: 'none' }

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  supaClient: any = null;

  constructor() {
    this.supaClient = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }

  userSubject: Subject<IUser> = new Subject;
  favoritesSubject: Subject<{id:number,uid:string,artwork_id:string}[]> = new Subject;

  async registrarUsuario(nombre: string, email: string, password:string) {
    const { user, error } = await this.supaClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      console.error('Error al registrar el usuario:', error.message);
    } else {
      console.log('Usuario registrado exitosamente:', user);
    }

    await this.supaClient.auth.update({
      data: { 'full_name': nombre }
    });
  }

  async iniciarSesion(email: string, password:string) {
    const { user, error } = await this.supaClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
    } else {
      console.log('Sesión iniciada exitosamente:', user);
      // Redirigir al usuario a otra página o realizar alguna acción adicional
    }
  }

  // async login(email: string, password: string):Promise<boolean>{
  //       let session = await this.supaClient.auth.getSession();
  //       let data, error;
  //       if(session.data.session){
  //         data = session.data.session;
  //       }
  //       else{
  //         session = await this.supaClient.auth.signInWithPassword({
  //           email,
  //           password
  //         });
  //         data = session.data;
  //         error = session.error;
  //         if(error){
  //          throw error;
  //        return false
  //         }
  //       }
  //       if(data.user != null){
  //         this.getProfile(data.user.id);
  //         return true;
  //       }
  //     return false;
  // }

  getProfile(userId:string): void{

    let profilePromise: Promise<{data: IUser[]}> = this.supaClient
    .from('profiles')
    .select("*")
    // Filters
    .eq('id', userId);

    from(profilePromise).pipe(
      tap(data => console.log(data))
      ).subscribe(async (profile:{data: IUser[]}) =>{
        this.userSubject.next(profile.data[0]);
        const avatarFile = profile.data[0].avatar_url.split('/').at(-1);
        const { data, error } = await this.supaClient.storage.from('avatars').download(avatarFile);
        const url = URL.createObjectURL(data)
        profile.data[0].avatar_url = url;
        this.userSubject.next(profile.data[0]);
      }

      );

  }

  async isLogged(){
    let {data,error} = await this.supaClient.auth.getSession();
    if(data.session){
      this.getProfile(data.session.user.id)
    }
  }

  async logout(){
    const { error } = await this.supaClient.auth.signOut();
    console.log("Logout");
    this.userSubject.next(emptyUser);
  }

  getFavorites(uid:string):void{
    let promiseFavorites: Promise<{data: {id:number,uid:string,artwork_id:string}[]}> = this.supaClient
    .from('favorites')
    .select("*")
    .eq('uid', uid);

    promiseFavorites.then((data)=> this.favoritesSubject.next(data.data));
  }

  async setFavorite(artwork_id:string): Promise<any>{

    console.log('setfavorite', artwork_id);


    let {data,error} = await this.supaClient.auth.getSession();
    let promiseFavorites: Promise<boolean> = this.supaClient
    .from('artworks')
    .insert({uid: data.session.user.id, artwork_id});


    promiseFavorites.then(()=>this.getFavorites(data.session.user.id));
  }

  async subirArchivo(archivo: File) {
    const { data, error } = await this.supaClient.storage.from('avatars').upload(archivo.name, archivo);

    if (error) {
      console.error('Error al subir el archivo:', error.message);
    } else {
      console.log('Archivo subido correctamente:', data);
    }
  }

  async actualizarPerfil(idUsuario: string, urlAvatar: string) {
    try {
      const { data, error } = await this.supaClient
        .from('usuarios')
        .update({ avatar: urlAvatar })
        .eq('id', idUsuario);

      if (error) {
        console.error('Error al actualizar el avatar:', error.message);
      } else {
        console.log('Avatar actualizado correctamente:', data);
      }
    } catch (error) {
      console.error('Error al actualizar el avatar');
    }
  }

  async fetchData() {
    try {
      const { data, error } = await this.supaClient.from('auth.users').select('*');
      
      if (error) {
        console.error('Error al obtener datos:', error.message);
      } else {
        console.log('Datos obtenidos:', data);
        // Asignar los datos a una variable en el componente para utilizarlos en la plantilla
      }
    } catch (error) {
      console.error('Error al obtener datos:');
    }
  }

  async setProfile(formulario: FormGroup) {
    const formData = formulario.value;
    let {data,error} = await this.supaClient.auth.getSession();
      const { data: updatedData, error: updateError } = await this.supaClient
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          website: formData.website,
        })
        .eq('id', data.session.user.id);
    }

    setUserId(id: string) {
      localStorage.setItem('userId', id);
    }
    getUserId() {
      return localStorage.getItem('userId');
    }


}




/*
npm install @supabase/supabase-js

*/
