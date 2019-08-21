import { AccountService } from './../services/account.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss']
})
export class FavouritesComponent implements OnInit {

  constructor(public account: AccountService) {
  }


  ngOnInit() {
  }

}
