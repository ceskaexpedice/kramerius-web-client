import { Folder } from "../model/folder.model";
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from "rxjs";
import { KrameriusApiService } from "./kramerius-api.service";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";


@Injectable()
export class FolderService {
    folders: any[]

    constructor(private auth: AuthService,
                private krameriusApiService: KrameriusApiService,
                private router: Router) { }

    getFolders(callback: (folders: Folder[]) => void) {
        console.log('getFolders');
        if (this.folders && this.folders.length > 0) {
            if (callback) {
                callback(this.folders);
            }
            return;
        }
        this.krameriusApiService.getFolders().subscribe(results => { 
            if (results) {
                this.folders = this.sortFoldersByOwner(results);
                if (callback) {
                    callback(this.folders);
                }
            }
        });
    }
    getFolder(uuid: string): Observable<any> {
        return this.krameriusApiService.getFolder(uuid);
    }
    getFolderItems(uuid: string): Observable<any> {
        return this.krameriusApiService.getFolderItems(uuid);
    }
    addFolder(name: string) {
        this.krameriusApiService.createNewFolder(name).subscribe(results => {
            console.log(results);
            this.folders[0].push(results);
            this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    deleteFolder(uuid: string) {
        this.krameriusApiService.deleteFolder(uuid).subscribe(results => {
            this.folders[0] = this.folders[0].filter(folder => folder['uuid'] != uuid);
            this.router.navigate(['/folders']);
        });
    }
    editFolder(uuid: string, name: string) {
        this.krameriusApiService.editFolder(uuid, name).subscribe(results => {
            this.folders[0].find(folder => {
                if (folder['uuid'] == uuid) {
                    folder['name'] = name;
                }
            });
        });
    }
    followFolder(folder: Folder) {
        this.krameriusApiService.followFolder(folder.uuid).subscribe(results => {
            console.log('followFolder', folder);
            this.folders[1].push(folder);
            // this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    unfollowFolder(uuid: string) {
        this.krameriusApiService.unfollowFolder(uuid).subscribe(results => {
            // console.log('results', results);
            this.folders[1] = this.folders[1].filter(folder => folder['uuid'] != uuid);
        });
    }
    addItemsToFolder(uuid: string, result: any) {
        const items = result.split(',').map(item => String(item.trim()));
        this.krameriusApiService.addItemToFolder(uuid, items).subscribe(results => {
            console.log('results', results);
            this.folders[0].find(folder => {
                if (folder['uuid'] == uuid) {
                    folder['items'] = items;
                }
            });
        });
    }
    removeItemsFromFolder(uuid: string, result: any) {
        console.log('result', result);
        // const items = result.split(',').map(item => String(item.trim()));
        const items = result;
        console.log('items', items);
        this.krameriusApiService.removeItemFromFolder(uuid, items).subscribe(results => {
            // console.log('results', results);
            this.folders[0].find(folder => {
                if (folder['uuid'] == uuid) {
                    // console.log('folder items', folder);
                    this.getFolder(uuid).subscribe(result => {
                        this.folders[0].find(folder => {
                            if (folder['uuid'] == uuid) {
                                folder['items'] = result['items'];
                            }
                        });
                    });
                    // folder['items'].filter(item => !items.includes(item));
                }
            });
        });
    }
    addFolderAndItem(name: string, uuid: string) {
        this.krameriusApiService.createNewFolder(name).subscribe(results => {
            console.log(results);
            this.folders[0].push(results);
            this.addItemsToFolder(results['uuid'], uuid);
            // this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    like(folder: Folder, uuid: string) {
        this.addItemsToFolder(folder.uuid, uuid)
        console.log('like');
    }
    dislike(folder: Folder, uuid: string) {
        this.removeItemsFromFolder(folder.uuid, uuid)
        console.log('dislike');
    }

    checkUser(folder: Folder): Observable<any> {
        let role;
        folder['users'][0].find(user => {
            if (this.auth.user) {
                if (user['userRole'] == 'owner' && user["userId"] == this.auth.user.uid) {
                    role = 'owner';
                }
                else if (user['userRole'] == 'follower' && user["userId"] == this.auth.user.uid) {
                    role = 'follower';
                }
            } else {
                this.auth.userInfo;
            }
        });
        return of(role);
    }

    mapFolderItemsToDocumentItems(folder: Folder): Observable<any> {
        let items = [];
        folder.items.map(item => {
          this.krameriusApiService.getItem(item.id).subscribe(i => {
            i.createdAt = item.createdAt;
            items.push(i);
          });
        });
        return of(items);
    }

    sortFoldersByOwner(folders: any): any[] {
        let myFolders: Folder[] = [];
        let sharedFolders: Folder[] = [];
        for (const folder of folders) {
            folder['users'][0].find(user => {
                if (this.auth.user) {
                    if (user['userRole'] == 'owner' && user["userId"] == this.auth.user.uid) {
                        folder.user = 'owner';
                        myFolders.push(folder);
                    }
                    else if (user['userRole'] == 'follower' && user["userId"] == this.auth.user.uid) {
                        folder.user = 'follower';
                        sharedFolders.push(folder);
                    }
                } else {
                    this.auth.userInfo;
                }  
            });
        }
        return [this.sortFoldersAlphabetically(myFolders), this.sortFoldersAlphabetically(sharedFolders)];
    }

    sortFoldersAlphabetically(folders: Folder[]): Folder[] {
        return folders.sort((a, b) => a['name'].localeCompare(b['name']));
    }

    getMyFolders() {
        if (this.folders && this.folders[0]) {
            return this.folders[0];
        }
    }

}