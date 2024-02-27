import { Component, Input, OnInit } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { FilterService } from '../../services/filter.service';
import { debounceTime, filter } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { PaginationComponent } from '../pagination/pagination.component';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [ArtworkComponent,
    ArtworkRowComponent,
    ArtworkFilterPipe,
    PaginationComponent
  ],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css'
})
export class ArtworkListComponent implements OnInit {

  constructor(private artService: ApiServiceService,
    private filterService: FilterService,
    private usesService: UsersService,
    private supa: SupabaseService
  ) {
  }

  numeropaginas_mostrar: number[] = [];
  id_cuadros_fav: string[] = [];

  ngOnInit(): void {
    console.log(this.onlyFavorites);
    //this.artService.getArtWorks().subscribe((artworkList: IArtwork[]) => this.quadres = artworkList);

    if (this.onlyFavorites != 'favorites') {
      this.artService.getArtWorks().pipe(
        // demanar i marcar les favorites
      )
        .subscribe((artworkList: IArtwork[]) => {
          this.quadres = artworkList
          console.log(this.quadres);
          console.log(this.paginas);
          
        });
         
    }
    else {
      // Demanar les favorites
      this.supa.obtenerFavoritos()
      .then((data) => {
        data?.map((artwork) => {
          this.id_cuadros_fav.push(artwork.artwork_id);
          
          //console.log(cuadroObtener);
        })
        this.artService.getArtworksFromIDs(this.id_cuadros_fav).subscribe((cuadros) => {
          this.quadres = cuadros;
          console.log(cuadros);
        })
        console.log('Datos obtenidos:', data);
      })
      .catch((error) => {
        console.error('Error al obtener datos:', error);
      });
        
    }

    


    this.filterService.searchFilter.pipe(
      //filter(f=> f.length> 4 || f.length ===0),
      debounceTime(500)
    ).subscribe(filter => this.artService.filterArtWorks(filter));

    
  }

  obtenerCuadrosPagina(pagina:any){
    this.artService.getArtworksFromPage(pagina).subscribe((datos:any) => {
      this.quadres = datos;
    });
    console.log(pagina);
  }

  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    this.usesService.setFavorite(artwork.id + "")
  }

  quadres: IArtwork[] | any = [];
  filter: string = '';
  @Input() onlyFavorites: string = '';
  paginas: number = 1;

  // Definir una variable para el número de iteraciones deseado
  numeroDeIteraciones: number = this.paginas;

  // Crear una función que devuelva un arreglo de números para usar en una directiva *ngFor
  crearArregloDeIteraciones(): any[] {
    return Array(this.numeroDeIteraciones).fill(0).map((x, i) => i);
  }

  

}
