import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  children = [];

  constructor(private route: ActivatedRoute,
              private krameriusApiService: KrameriusApiService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.loadDocument(uuid);
      }
    });
  }


  private loadDocument(uuid: string) {
    const ctx = this;
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      console.log(response);
      ctx.children = response;
    });
  }

}
