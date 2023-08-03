import { Folder } from "../model/folder.model";
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from "rxjs";
import { KrameriusApiService } from "./kramerius-api.service";
import { Router } from "@angular/router";


@Injectable()
export class FolderService {
    private apiUrl: string = 'https://tomcat.kramerius.trinera.cloud/kramerius-folders/api/folders';
    private username = 'pavla'
    private password = 'blabla'

    folders: any[]

    constructor(private http: HttpClient,
                private krameriusApiService: KrameriusApiService,
                private router: Router) { }
    
    
    // API
    
    getFolders(callback: (folders: Folder[]) => void) {
        if (this.folders && this.folders.length > 0) {
            callback(this.folders);
            return;
        }
        console.log('=== loading new data from server');
        const headers = new HttpHeaders({
          Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        this.http.get<any>(this.apiUrl, { headers }).subscribe(results => { 
            this.folders = this.sortFoldersByOwner(results);
            if (callback) {
                callback(this.folders);
            }
            // this.foldersUpdated.next([...this.folders]);
        });
    }
    getFolder(uuid: string): Observable<any> {
        const headers = new HttpHeaders({
          Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.get<any>(this.apiUrl + '/' + uuid, { headers });
    }
    getFolderItems(uuid: string): Observable<any> {
        const headers = new HttpHeaders({
          Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.get<any>(this.apiUrl + '/' + uuid + '/items', { headers });
    }
    createNewFolder(name: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        let body = {"name": name};
        return this.http.post<any>(this.apiUrl + '/', body, { headers })
    }
    deleteFolderApi(uuid: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.delete<any>(this.apiUrl + '/' + uuid, { headers })
    }
    editFolderApi(uuid: string, name: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        let body = {"name": name};
        return this.http.put<any>(this.apiUrl + '/' + uuid, body, { headers })
    }
    followFolderApi(uuid: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.post<any>(this.apiUrl + '/' + uuid + '/follow', {}, { headers })
    }
    unfollowFolderApi(uuid: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.post<any>(this.apiUrl + '/' + uuid + '/unfollow', {}, { headers })
    }
    addItemToFolderApi(uuid: string, items: any): Observable<any> {
        let body = {"items": items};
        console.log('body', body);
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        return this.http.put<any>(this.apiUrl + '/' + uuid + '/items', body, { headers })
    }

    // FUNKCE

    addFolder(name: string) {
        this.createNewFolder(name).subscribe(results => {
            console.log(results);
            this.folders[0].push(results);
            this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    deleteFolder(uuid: string) {
        this.deleteFolderApi(uuid).subscribe(results => {
            this.folders[0] = this.folders[0].filter(folder => folder['uuid'] != uuid);
            this.router.navigate(['/folders']);
        });
    }
    editFolder(uuid: string, name: string) {
        console.log('name', name);
        this.editFolderApi(uuid, name).subscribe(results => {
            this.folders[0].find(folder => {
                if (folder['uuid'] == uuid) {
                    folder['name'] = name;
                }
            });
        });
    }
    followFolder(folder: Folder) {
        this.followFolderApi(folder.uuid).subscribe(results => {
            console.log('followFolder', results);
            this.folders[1].push(folder);
            // this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    unfollowFolder(uuid: string) {
        this.unfollowFolderApi(uuid).subscribe(results => {
            console.log('results', results);
            this.folders[1] = this.folders[1].filter(folder => folder['uuid'] != uuid);
        });
    }
    addItemsToFolder(uuid: string, result: any) {
        const items = result.split(',').map(item => String(item.trim()));
        this.addItemToFolderApi(uuid, items).subscribe(results => {
            console.log('results', results);
            this.folders[0].find(folder => {
                if (folder['uuid'] == uuid) {
                    folder['items'] = items;
                }
            });
        });
    }
    like(folder: Folder, uuid: string) {
        this.addItemsToFolder(folder.uuid, uuid)
        console.log('like');
    }

    checkUser(folder: Folder): Observable<any> {
        let role;
        folder['users'][0].find(user => {
            if (user['userRole'] == 'owner' && user["userId"] == this.username) {
                role = 'owner';
            }
            else if (user['userRole'] == 'follower' && user["userId"] == this.username) {
                role = 'follower';
            }
        });
        return of(role);
    }

    mapFolderItemsToDocumentItems(folder: Folder): Observable<any> {
        let items = [];
        folder.items.map(item => {
          this.krameriusApiService.getItem(item).subscribe(i => {
            items.push(i);
          });
        });
        return of(items);
    }

    sortFoldersByOwner(folders: Folder[]): any[] {
        let myFolders: Folder[] = [];
        let sharedFolders: Folder[] = [];
        for (const folder of folders) {
            folder['users'][0].find(user => {
                if (user['userRole'] == 'owner' && user["userId"] == this.username) {
                    folder.user = 'owner';
                    myFolders.push(folder);
                }
                else if (user['userRole'] == 'follower' && user["userId"] == this.username) {
                    folder.user = 'follower';
                    sharedFolders.push(folder);
                }
            });
        }
        return [this.sortFoldersAlphabetically(myFolders), this.sortFoldersAlphabetically(sharedFolders)];
    }

    sortFoldersAlphabetically(folders: Folder[]): Folder[] {
        return folders.sort((a, b) => a['name'].localeCompare(b['name']));
    }
}