export class Track {

    uuid: string;
    isPublic: boolean;
    name: string;
    unit: string;

    constructor(uuid: string, name: string, unit: string, isPublic: boolean) {
        this.uuid = uuid;
        this.name = name;
        this.unit = unit;
        this.isPublic = isPublic;
    }

}
