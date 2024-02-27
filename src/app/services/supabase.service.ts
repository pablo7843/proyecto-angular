import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { from, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY)
  }

  favoritesSubject: Subject<{ id: number; uid: string; artwork_id: string }[]> =
    new Subject();

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file)
  }

  async insertarFavoritos(artwork_id: string) {
    // Consulta para verificar si ya existe un favorito con el mismo artwork_id y uid
    const { data: existingFavoritos, error: existingError } = await this.supabase
      .from('artworks')
      .select('*')
      .eq('uid', this.session?.user.id)
      .eq('artwork_id', artwork_id);

    if (existingError) {
      console.error('Error al obtener datos existentes:', existingError.message);
      return;
    }

    if (existingFavoritos && existingFavoritos.length > 0) {
      this.deleteFavoritos(artwork_id);
      this.obtenerFavoritos();
      location.hash = "#/";
      location.hash = "#/artworks/favorites";
      return;
    }

    // Si no existe, procede con la inserción
    const { data, error } = await this.supabase
      .from('artworks')
      .insert([
        { uid: this.session?.user.id, artwork_id }
      ]);

    if (error) {
      console.error('Error al insertar datos:', error.message);
    } else {
      console.log('Datos insertados correctamente:', data);
    }
  }

  async deleteFavoritos(artwork_id: string) {
    const { data, error } = await this.supabase
      .from('artworks')
      .delete().eq
        ( 'uid', this.session?.user.id).eq('artwork_id', artwork_id);
    if (error) {
      console.log(this.session?.user.id);
      console.error('Error al insertar datos:', error.message);
    } else {
      console.log(this.session?.user.id);
      console.log('Datos insertados correctamente:', data);
    }
  }

  async obtenerFavoritos(){
    const { data, error } = await this.supabase
      .from('artworks')
      .select('*')
      .eq('uid', this.session?.user.id); // Esto agrega la cláusula WHERE

    if (error) {
      console.error('Error al obtener datos filtrados:', error.message);
      return 
    } else {
      
      console.log('Datos filtrados obtenidos correctamente:', data);
      return data;
    }
  }
}