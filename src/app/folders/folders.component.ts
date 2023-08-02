import { Component, OnDestroy, OnInit } from '@angular/core';
import { Folder } from '../model/folder.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../services/folder.service';
import { MatDialog } from '@angular/material/dialog';
import { FolderDialogComponent } from '../dialog/folder-dialog/folder-dialog.component';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit, OnDestroy {

  folder: Folder;
  loading: boolean = true;
  name: string;
  
  constructor(private route: ActivatedRoute,
              private router: Router,
              public folderService: FolderService,
              private dialog: MatDialog) {  }

  ngOnInit(): void {
    // console.log('======ngOnInit');
    this.loading = true;
    this.folderService.getFolders((folders: Folder[]) => {
      // console.log('======folders loaded');

      this.route.paramMap.subscribe(params => {
        let uuid = params.get('uuid');
        // console.log('======uuid v ngOnInit paramMap', uuid);
        // console.log('======folders', this.folderService.folders);
        if (uuid) {
          this.folderService.getFolder(uuid).subscribe(folder => {
              console.log('folder', folder);
              this.folder = Folder.fromJson(folder);
              this.folderService.checkUser(folder).subscribe(user => {
                this.folder.user = user;
                console.log('this.folder', this.folder);
              });
              if (folder.items) {
                this.folderService.mapFolderItemsToDocumentItems(this.folder).subscribe(items => {
                  this.folder.items = items; 
                });
              }
              console.log('this.folder', this.folder);
              this.loading = false;
            });
        } else {
          if (this.folderService.folders[0] && this.folderService.folders[0][0]) {
            this.folderService.getFolder(this.folderService.folders[0][0]['uuid']).subscribe(folder => {
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
  }
  
  openFoldersDialog() {
    this.name = '';
    const dialogRef = this.dialog.open(FolderDialogComponent, { 
      data: {
        title: 'Vytvořit nový seznam',
        message: 'Jméno nového seznamu',
        name: this.name,
        button: 'Vytvořit'},
      autoFocus: false });
      
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

  ngOnDestroy() {
    console.log('======ngOnDestroy');

  }

}
