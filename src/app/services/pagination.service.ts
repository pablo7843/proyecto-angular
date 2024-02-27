import { Injectable } from '@angular/core';
import { IPagination } from '../interfaces/i-pagination';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  private currentPageService: any;
  pagination: IPagination;

  constructor() {
    this.pagination = {
      total: 0,
      limit: 0,
      first_page: 1,
      current_page: 1,
      total_pages: 0
    }
  }

  setPage(page:number){
    this.pagination.current_page = page;
  }

  getPage(){
    return this.pagination.current_page;
  }
  

}
