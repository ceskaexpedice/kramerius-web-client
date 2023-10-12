export class Folder {

    uuid: string;
    name: string;
    items: any[];
    user: string;
    users: any[];

    static fromJson(json): Folder {
        if (json) {
            const folder = new Folder();
            folder.uuid = json['uuid'];
            folder.name = json['name'];
            let items = [];
            for (let item of json['items'][0]) {
                if (item) {
                    items.push(item);
                }
            }
            folder.items = items;
            return folder;
        }
        return null;
    }
}