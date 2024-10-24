import { Component, OnDestroy, OnInit } from '@angular/core';
import { Folder } from '../model/folder.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../services/folder.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { FolderDialogComponent } from '../dialog/folder-dialog/folder-dialog.component';
import { HistoryService } from '../services/history.service';
import { Subscription } from 'rxjs';
import { KrameriusApiService } from '../services/kramerius-api.service';
import { AuthService } from '../services/auth.service';
import { AppSettings } from '../services/app-settings';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit, OnDestroy {

  folder: Folder;
  loading: boolean = true;
  name: string;
  userSubscription: Subscription;
  searchQuery: string = null;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public folderService: FolderService,
              private dialog: MatDialog,
              private history: HistoryService,
              private api: KrameriusApiService,
              public authService: AuthService,
              private translate: TranslateService,
              public settings: AppSettings) {
               }

  ngOnInit(): void {
    console.log('======ngOnInit Folders');
    this.folderService.folders = null; // reset folders
    if (!this.settings.folders) {
      this.router.navigateByUrl(this.settings.getRouteFor(''));
      // return;
      // this.settings.getRouteFor(''); // redirect to home
    }
    this.loading = true;
    if (this.authService.user) {
      console.log('+++++++ user v ngOnInit 1', this.authService.user);
      if (this.authService.user.authenticated) {
        this.folderService.getFolders((folders: Folder[]) => {
          this.route.paramMap.subscribe(params => {
            let uuid = params.get('uuid');
            if (uuid) {
              this.folderService.getFolder(uuid).subscribe(folder => {
                this.folder = Folder.fromJson(folder);
                this.folderService.checkUser(folder).subscribe(user => {
                  this.folder.user = user;
                });
                if (folder.items) {
                  this.folderService.mapFolderItemsToDocumentItems(this.folder).subscribe(items => {
                    this.folder.items = items;
                    console.log('folder.items', this.folder.items);
                  });
                }
                this.loading = false;
              });
            } else {
              if (this.folderService.folders[0] && this.folderService.folders[0][0]) {
                this.folderService.getFolder(this.folderService.folders[0][0]['uuid']).subscribe(folder => {
                  this.history.removeCurrent();
                  this.router.navigate(['/folders', this.folderService.folders[0][0]['uuid']]);
                  this.loading = false;
                });
              }
              else if (this.folderService.folders[1] && this.folderService.folders[1][0]) {
                this.folderService.getFolder(this.folderService.folders[1][0]['uuid']).subscribe(folder => {
                  this.router.navigate(['/folders', this.folderService.folders[1][0]['uuid']]);
                  this.loading = false;
                });
              }
              else {
                console.log('neni zadny folder');
                this.loading = false;
              }
            }
          });
        });
      } else {
        console.log('user not authenticated 1');
        this.route.paramMap.subscribe(params => {
          let uuid = params.get('uuid');
          console.log('======uuid v ngOnInit paramMap', uuid);
          if (uuid) {
            this.folderService.getFolder(uuid).subscribe(folder => {
                this.folder = Folder.fromJson(folder);
                this.folderService.checkUser(folder).subscribe(user => {
                  this.folder.user = user;
                });
                if (folder.items) {
                  this.folderService.mapFolderItemsToDocumentItems(this.folder).subscribe(items => {
                    this.folder.items = items;
                  });
                }
                this.loading = false;
              });
          } else {
            this.router.navigateByUrl(this.settings.getRouteFor(''));
          }
        });
      }
    }
    
    this.userSubscription = this.authService.watchUser().subscribe((user) => {
      console.log('+++++++ user v ngOnInit 2', user);
        if (user.authenticated) {
          this.folderService.getFolders((folders: Folder[]) => {
            this.route.paramMap.subscribe(params => {
              let uuid = params.get('uuid');
              if (uuid) {
                this.folderService.getFolder(uuid).subscribe(folder => {
                    this.folder = Folder.fromJson(folder);
                    this.folderService.checkUser(folder).subscribe(user => {
                      this.folder.user = user;
                    });
                    if (folder.items) {
                      this.folderService.mapFolderItemsToDocumentItems(this.folder).subscribe(items => {
                        this.folder.items = items;
                        console.log('folder.items', this.folder.items);
                      });
                    }
                    this.loading = false;
                  });
              } else {
                if (this.folderService.folders[0] && this.folderService.folders[0][0]) {
                  this.folderService.getFolder(this.folderService.folders[0][0]['uuid']).subscribe(folder => {
                    this.history.removeCurrent();
                    this.router.navigate(['/folders', this.folderService.folders[0][0]['uuid']]);
                    this.loading = false;
                  });
                }
                else if (this.folderService.folders[1] && this.folderService.folders[1][0]) {
                  this.folderService.getFolder(this.folderService.folders[1][0]['uuid']).subscribe(folder => {
                    this.router.navigate(['/folders', this.folderService.folders[1][0]['uuid']]);
                    this.loading = false;
                  });
                }
                else {
                  console.log('neni zadny folder');
                  this.loading = false;
                }
              }
            });
          });
        } else {
          console.log('user not authenticated 2');
          this.route.paramMap.subscribe(params => {
            let uuid = params.get('uuid');
            if (uuid) {
              this.folderService.getFolder(uuid).subscribe(folder => {
                this.folder = Folder.fromJson(folder);
                this.folderService.checkUser(folder).subscribe(user => {
                  this.folder.user = user;
                });
                if (folder.items) {
                  this.folderService.mapFolderItemsToDocumentItems(this.folder).subscribe(items => {
                    this.folder.items = items;
                  });
                }
                this.loading = false;
              });
            } else {
              this.router.navigateByUrl(this.settings.getRouteFor(''));
            }
          });
        } 
      });
  }
  
  openFoldersDialog() {
    this.name = '';
    const dialogRef = this.dialog.open(FolderDialogComponent, { 
      data: {
        title: 'folders.dialogs.add_new_folder',
        message: 'folders.dialogs.add_new_folder_name',
        name: this.name,
        button: 'folders.dialogs.create'},
       });
      
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed', result);
        this.name = result;
        if (result) {
          this.folderService.addFolder(result)
        }
        else {
          console.log('neni zadano jmeno');
        }
      });
  }

  deleteFolder(uuid: string) {
    this.folderService.deleteFolder(uuid);
    // this.router.navigate(['/folders']);
  }

  findUser(folder: Folder) {
    // console.log('findUser', folder);
    if (folder && folder.users) {
      return folder.users[0].find(user => user.userRole == "owner").userId;
    }
  }

  searchFolder() {
    if (this.searchQuery && this.searchQuery.length > 0) {
      this.router.navigate(['search'], { queryParams: { folder: this.folder.uuid, q: this.searchQuery } });
    }
  }
  cleanQuery() {
    this.searchQuery = null;
  }

  ngOnDestroy() {
    console.log('======ngOnDestroy');
    this.folderService.folders = null;
    this.userSubscription.unsubscribe();
  }

}
