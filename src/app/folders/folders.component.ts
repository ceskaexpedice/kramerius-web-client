import { Component, OnDestroy, OnInit } from '@angular/core';
import { KrameriusApiService } from '../services/kramerius-api.service';
import { Folder } from '../model/folder.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../services/folder.service';
import { MatDialog } from '@angular/material/dialog';
import { FolderDialogComponent } from '../dialog/folder-dialog/folder-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit, OnDestroy {

  folders: Folder[] = [];
  folder: Folder;
  loading: boolean = true;
  name: string;
  private foldersSub: Subscription;
  
  constructor(private krameriusApiService: KrameriusApiService,
              private route: ActivatedRoute,
              private router: Router,
              private folderService: FolderService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.folderService.getFolders();
    this.foldersSub = this.folderService.getFolderUpdateListener().subscribe((folders: Folder[]) => {
      this.folders = folders;
      this.route.paramMap.subscribe(params => {
        let uuid = params.get('uuid');
        if (uuid) {
          this.folderService.getFolder(uuid).subscribe(folder => {
            this.folder = Folder.fromJson(folder);
            if (folder.items) {
              this.folderService.mapFolderItemsToDocuments(this.folder).subscribe(items => {
                this.folder.items = items;
                this.loading = false;
              });
            }
          });
        } else { 
          this.folderService.getFolder(this.folders[0][0]['uuid']).subscribe(folder => {
            this.folder = Folder.fromJson(folder);
            this.router.navigate(['/folders', this.folders[0][0]['uuid']]);
            this.loading = false;
          });
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
    this.foldersSub.unsubscribe();
  }

}
