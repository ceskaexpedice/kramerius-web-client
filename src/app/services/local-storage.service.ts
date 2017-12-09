import { Metadata } from './../model/metadata.model';
import { DocumentItem } from './../model/document_item.model';
import { Injectable } from '@angular/core';


@Injectable()
export class LocalStorageService {

    private static VISITED_TYPES = ['monograph', 'periodical', 'soundrecording', 'map', 'graphic', 'sheetmusic', 'archive', 'manuscript'];
    
    
    public static FEATURED_TAB = 'featured_tab';

    addToVisited(item: DocumentItem, metadata: Metadata) {
        if (LocalStorageService.VISITED_TYPES.indexOf(item.doctype) < 0) {
            return;
        }
        const visited: DocumentItem[] = JSON.parse(localStorage.getItem('visited') || '[]');
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
        }

        visited.unshift(item);
        if (visited.length > 9) {
            visited.pop();
        }
        localStorage.setItem('visited', JSON.stringify(visited));
    }

    getVisited(): DocumentItem[] {
        return JSON.parse(localStorage.getItem('visited') || '[]');
    }

    getProperty(tab: string) {
        return localStorage.getItem(tab);
    }

    setProperty(tab: string, property) {
        return localStorage.setItem(tab, property);
    }


}
