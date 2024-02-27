
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkListComponent } from '../artwork-list/artwork-list.component';
import { IArtwork } from '../../interfaces/i-artwork';
import { PaginationService } from '../../services/pagination.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ArtworkListComponent, RouterLink,FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() currentPage: number= this.paginationService.getPage() ;
  @Input() totalPages: number = 0;
  pageNumberInput: number = 1;


  constructor(private router: Router, private http: HttpClient, private apiService: ApiServiceService, private paginationService: PaginationService) { }

  ngOnInit(): void {
    this.fetchTotalPages(); 
    this.paginationService.setPage(this.currentPage);
    console.log('pagina' ,this.paginationService.getPage());
    
  }

  fetchTotalPages(): void {
    this.http.get<any>('https://api.artic.edu/api/v1/artworks')
      .subscribe((response: any) => {
        this.totalPages = response.pagination.total_pages;
      });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1; 
      this.paginationService.setPage(this.currentPage);
      this.apiService.getArtworksFromPage(this.currentPage);

      this.router.navigate(['/artwork/page/', this.currentPage]);
    }
  }
  
  goPage(page:number): void{
    this.currentPage=page;
    this.paginationService.setPage(this.currentPage);
    this.router.navigate(['/artwork/page/', this.currentPage]);
    this.apiService.getArtworksFromPage(this.currentPage);
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      console.log(this.currentPage);
      
      this.currentPage += 1; 
      this.paginationService.setPage(this.currentPage);
      this.router.navigate(['/artwork/page/', this.currentPage]);
      this.apiService.getArtworksFromPage(this.currentPage);
      console.log(this.currentPage);
      
    }
  }



  goToPageInput(): void {
    if (this.pageNumberInput >= 1 && this.pageNumberInput <= this.totalPages) {
      this.currentPage = this.pageNumberInput;
      this.paginationService.setPage(this.currentPage);
      this.router.navigate(['/artwork/page/', this.currentPage]);
      this.apiService.getArtworksFromPage(this.currentPage);
    } else {
      
      alert('El número de página ingresado está fuera de rango.');
    }
  }


 
}