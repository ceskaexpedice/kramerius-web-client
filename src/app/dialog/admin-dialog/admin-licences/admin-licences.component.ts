import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../services/admin-api.service';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { SolrService } from '../../../services/solr.service';

@Component({
  selector: 'app-admin-licences',
  templateUrl: './admin-licences.component.html',
  styleUrls: ['./admin-licences.component.scss']
})
export class AdminLicencesComponent implements OnInit {
  state: string;
  _uuids: string[];

  licencesIn: any;
  licencesAll: Licence[];
  licencesRest: Licence[];

  @Input() 
  set uuids(uuids: string[]) {
    this.onUuidChanged(uuids);
  }

  constructor(private api: KrameriusApiService, 
              private solr: SolrService,
              private snackBar: MatSnackBar,
              private adminApi: AdminApiService) { }

  ngOnInit(): void {
    
  }

  loadLicences() {
    this.state = 'loading';
    if (this._uuids.length == 1) {
      this.adminApi.getAllLicences().subscribe((licences: Licence[]) => {
        this.licencesAll = licences;
        this.adminApi.getLicences(this._uuids).subscribe((licences: any) => {
          const licencesIn = licences;
          this.licencesIn = licencesIn.licenses.map((licence) => {
            return this.licencesAll.find((l) => l.name === licence);
          });
          this.licencesRest = this.licencesAll.filter((licence) => {
            return !this.licencesIn.find((l) => l === licence);
          });
          console.log('licences', this.licencesAll, this.licencesIn, this.licencesRest);
          this.state = 'ok';
        });
      });
    } else {
      this.adminApi.getAllLicences().subscribe((licences: Licence[]) => {
        this.licencesAll = licences;
        this.licencesIn = [];
        this.licencesRest = this.licencesAll;
        this.state = 'ok';
      });
    }
  }

  onUuidChanged(uuids: string[]) {
    this._uuids = uuids;
    this.state = 'loading';
    this.licencesIn = [];
    this.licencesAll = [];
    this.licencesRest = [];
    this.loadLicences();
  }

  removeLicence(licence: Licence, index = 0) {
    this.state = 'progress';
    this.adminApi.removeLicence(this._uuids[index], licence.name).subscribe(() => {
      if (index + 1 >= this._uuids.length) {
        this.snackBar.open("Odebrání licence bylo naplánováno", '', { duration: 3000, verticalPosition: 'bottom' });
        this.licencesIn.splice(this.licencesIn.indexOf(licence), 1);
        this.licencesRest.unshift(licence);
        this.state = 'ok';
      } else {
        this.removeLicence(licence, index + 1);
      }
    });
  }

  addLicence(licence: Licence, index = 0) {
    console.log('addLicence', licence);
    this.state = 'progress';
    this.adminApi.addLicence(this._uuids[index], licence.name).subscribe(() => {
      if (index + 1 >= this._uuids.length) {
        this.snackBar.open("Přidání licence bylo naplánováno", '', { duration: 3000, verticalPosition: 'bottom' });
        this.licencesRest.splice(this.licencesIn.indexOf(licence), 1);
        this.licencesIn.unshift(licence);
        this.state = 'ok';
      } else {
        this.addLicence(licence, index + 1);
      }
    });
  }
}

interface Licence {
  id: number;
  name: string;
  description: string;
  group: string;
  priority: number;
}
