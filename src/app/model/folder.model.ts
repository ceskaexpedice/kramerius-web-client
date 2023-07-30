import { KrameriusApiService } from "../services/kramerius-api.service";

export class Folder {

    pid: string;
    name: string;
    items: string[];



    static fromJson(json): Folder {
        if (json) {
            const folder = new Folder();
            folder.pid = json['uuid'];
            folder.name = json['name'];
            let items = [];
            for (let item of json['items'][0]) {
                if (item['id']) {
                    items.push(item['id']);
                }
            }
            folder.items = items;
            return folder;
        }
        return null;
    }

    static folders: Folder[] = [
        {   pid: 'uuid1',
            name: 'Folder 1',
            items: ['aa11', 'aa12']
        }, 
        {   pid: 'uuid2',
            name: 'Folder 2',
            items: ['aa21', 'aa22']
        },
        {   pid: 'uuid3',
            name: 'Folder 3',
            items: ['aa31', 'aa32']
        },
        {   pid: 'uuid4',
            name: 'Folder 4',
            items: ['aa14', 'aa42']
        }, 
        {   pid: 'uuid5',
            name: 'Folder 5',
            items: ['aa51', 'aa52']
        },
        {   pid: 'uuid6',
            name: 'Folder 6',
            items: ['aa61', 'aa62']
        }
    ];



}