import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { RouterLink } from '@angular/router';
import { ApiServiceService } from '../../services/api-service.service';
import { SupabaseService } from '../../services/supabase.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-artwork',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './artwork.component.html',
  styleUrl: './artwork.component.css'
})
export class ArtworkComponent  implements OnInit{

  @Input() artwork!: IArtwork;
  @Input() id?: any;

  ids:any = [this.id];


  quadres: IArtwork[] = [];

ngOnInit(): void {
  console.log(this.id);

  this.artService.getArtworksFromIDs([this.id])
        .subscribe((artworkList: IArtwork[]) => {
          this.quadres = artworkList;
          return this.quadres;
          
        });
}

constructor(private artService: ApiServiceService, private supabase: SupabaseService, private user: UsersService){}


@Output() likeChanged = new EventEmitter<boolean>();

toggleLike(){
  this.artwork.like = !this.artwork.like;
  //this.likeChanged.emit(this.artwork.like);
  //this.supabase.deleteFavoritos(this.artwork.id);
  
  this.supabase.insertarFavoritos(this.artwork.id);

}

mouseover: boolean = false
}
