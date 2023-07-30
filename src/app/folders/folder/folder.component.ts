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
  name: string;
  @Input() folder: Folder;

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
      autoFocus: false });
      
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed', result);
        if (result) {
          this.folderService.deleteFolder(uuid)
        }
        else {
          console.log('neni zadano jmeno');
        }
      });
  }
  openEditFolderDialog(uuid: string) {
    this.name = this.folder.name;
    const dialogRef = this.dialog.open(FolderDialogComponent, { 
      data: {
        title: 'Upravit název seznamu',
        message: '',
        name: this.name,
        button: 'Uložit'}, 
      autoFocus: false });
      
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed', result);
        this.name = result;
        if (result) {
          this.folderService.editFolder(uuid, result)
        }
        else {
          console.log('neni zadano jmeno');
        }
      });
  }

}
