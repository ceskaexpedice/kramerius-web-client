import { AppSettings } from './app-settings';
import { Metadata } from './../model/metadata.model';
import { DocumentItem } from './../model/document_item.model';
import { Injectable } from '@angular/core';


@Injectable()
export class LocalStorageService {

    public static FEATURED_TAB = 'featured_tab';
    private static ACCESSIBILITY_FILTER = 'accessibility_filter';
    public static DOUBLE_PAGE = 'double_page';
    public static ZOOM_LOCK = 'zoom_lock';
    public static PERIODICAL_VOLUMES_LAYOUT = 'periodical_volumes_layout';
    public static PERIODICAL_ISSUES_LAYOUT = 'periodical_issues_layout';
    public static PERIODICAL_VOLUMES_REVERSE_ORDER = 'periodical_volumes_reverse_order';
    public static PERIODICAL_ISSUES_REVERSE_ORDER = 'periodical_issues_reverse_order';
    public static PERIODICAL_FULLTEXT_SORT = 'periodical_fulltext_sort';

    constructor(private appSettings: AppSettings) {
    }

    addToVisited(item: DocumentItem, metadata: Metadata) {
        if (!this.prefAllowed()) {
            return;
        }
        if (this.appSettings.doctypes.indexOf(item.doctype) < 0) {
            return;
        }
        const visited: DocumentItem[] = JSON.parse(localStorage.getItem(this.getVisitedKey()) || '[]');
        let match = -1;
        for (let i = 0; i < visited.length; i++) {
            if (visited[i].uuid === item.uuid) {
                match = i;
                break;
            }
        }
        if (match > -1) {
            visited.splice(match, 1);
        }
        if (metadata) {
            if (metadata.publishers.length > 0) {
                item.date = metadata.publishers[0].date;
            }
            const authors = [];
            for (const author of metadata.authors) {
                authors.push(author.name);
            }
            item.authors = authors;
            if (this.appSettings.multiKramerius) {
                item.library = this.appSettings.code;
            }
        }

        visited.unshift(item);
        if (visited.length > 24) {
            visited.pop();
        }
        localStorage.setItem(this.getVisitedKey(), JSON.stringify(visited));
    }

    getVisited(): DocumentItem[] {
        if (!this.prefAllowed()) {
            return [];
        }
        return JSON.parse(localStorage.getItem(this.getVisitedKey()) || '[]');
    }

    getProperty(property: string) {
        if (!this.prefAllowed()) {
            return null;
        }
        return localStorage.getItem(property);
    }

    setProperty(property: string, value) {
        if (!this.prefAllowed()) {
            return;
        }
        return localStorage.setItem(property, value);
    }

    publicFilterChecked(): boolean {
        if (!this.prefAllowed()) {
            return this.appSettings.publicFilterDefault;
        }
        const value = localStorage.getItem(LocalStorageService.ACCESSIBILITY_FILTER);
        if (value === '1') {
            return true;
        } else if (value === '0') {
            return false;
        }
        return this.appSettings.publicFilterDefault;
    }

    setPublicFilter(value: boolean) {
        if (!this.prefAllowed()) {
            return;
        }
        this.setProperty(LocalStorageService.ACCESSIBILITY_FILTER, value ? '1' : '0');
    }

    private getVisitedKey(): string {
        return 'visited_documents'; // + this.appSettings.code;
    }

    private prefAllowed(): boolean {
        return !this.appSettings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'preferential';
    }

}
