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

    private folders: any[]
    private foldersUpdated = new Subject<any[]>();

    constructor(private http: HttpClient,
                private krameriusApiService: KrameriusApiService,
                private router: Router) { }
    
    
    // API
    
    getFolders() {
        const headers = new HttpHeaders({
          Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
        });
        this.http.get<any>(this.apiUrl, { headers }).subscribe(results => { 
            this.folders = this.sortFoldersByOwner(results);
            this.foldersUpdated.next([...this.folders]);
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

    // FUNKCE
    addFolder(name: string) {
        this.createNewFolder(name).subscribe(results => {
            console.log(results);
            this.folders[0].push(results);
            this.foldersUpdated.next([...this.folders]);
            this.router.navigate(['folders/' + results['uuid']]);
        });
    }
    deleteFolder(uuid: string) {
        this.deleteFolderApi(uuid).subscribe(results => {
            this.folders[0] = this.folders[0].filter(folder => folder['uuid'] != uuid);
            this.foldersUpdated.next([...this.folders]); 
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
            this.foldersUpdated.next([...this.folders]);
        });
    }
    getFolderUpdateListener() {
        return this.foldersUpdated.asObservable();
    }

    mapFolderItemsToDocuments(folder: Folder): Observable<any> {
        let items = [];
        folder.items.map(item => {
          this.krameriusApiService.getItem(item).subscribe(i => {
            items.push(i);
          });
        });
        return of(items);
    }

    sortFoldersByOwner(folders: Folder[]): any[] {
        // return folders.filter(folder => {
            let myFolders = [];
            let sharedFolders = [];
            for (const folder of folders) {
                folder['users'][0].find(user => {
                    // console.log('user', user);
                    if (user['userRole'] == 'owner' && user["userId"] == this.username) {
                        // console.log('owner');
                        myFolders.push(folder);
                    }
                    else if (user['userRole'] == 'follower' && user["userId"] == this.username) {
                        sharedFolders.push(folder);
                    }
                });
            }
            return [this.sortFoldersAlphabetically(myFolders), this.sortFoldersAlphabetically(sharedFolders)];

        // });
    }

    sortFoldersAlphabetically(folders: Folder[]): Folder[] {
        return folders.sort((a, b) => a['name'].localeCompare(b['name']));
    }
}