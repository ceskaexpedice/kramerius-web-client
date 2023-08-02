import { Component, Input, OnInit } from '@angular/core';
import { Folder } from './../../model/folder.model';
import { FolderService } from './../../services/folder.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FolderConfirmDialogComponent } from '../../dialog/folder-confirm-dialog/folder-confirm-dialog.component';
import { FolderDialogComponent } from '../../dialog/folder-dialog/folder-dialog.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  @Input() folder: Folder;
  @Input() user: string;

  constructor(private folderService: FolderService,
              private router: Router,
              private dialog: MatDialog) {  }

  ngOnInit(): void {
    // console.log('folder', this.folder);
  }
  openDeleteFolderDialog(uuid: string) {
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Smazat seznam',
        message: 'Opravdu chcete smazat seznam ' + this.folder.name +'?',
        confirm: 'confirm'}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.folderService.deleteFolder(uuid)
        this.router.navigate(['/folders']);
      }
      // else {
      //   console.log('neni zadano jmeno');
      // }
    });
  }
  openEditFolderDialog(uuid: string) {
    const name = this.folder.name;
    const dialogRef = this.dialog.open(FolderDialogComponent, { 
      data: {
        title: 'Upravit název seznamu',
        message: '',
        name: name,
        button: 'Uložit'}, 
      autoFocus: false });
      
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed', result);
        this.folder.name = result;
        if (result) {
          this.folderService.editFolder(uuid, result)
        }
        else {
          console.log('neni zadano jmeno');
        }
      });
  }
  openUnfollowFolderDialog(uuid: string) {
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Přestat sledovat seznam',
        message: 'Opravdu chcete přestat sledovat seznam ' + this.folder.name +'?',
        confirm: 'confirm'}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.folderService.unfollowFolder(uuid)
      }
      else {
        console.log('neni zadano jmeno');
      }
    });
  }
  openFollowFolderDialog(folder: Folder) {
    console.log('folder', folder);
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Sledovat seznam',
        message: 'Opravdu chcete sledovat seznam ' + this.folder.name +'?',
        confirm: 'confirm'}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.folderService.followFolder(folder)
      }
      else {
        console.log('neni zadano jmeno');
      }
    });
  }

}
