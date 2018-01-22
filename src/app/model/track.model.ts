import { SoundUnit } from './soundunit.model';
export class Track {

    uuid: string;
    isPublic: boolean;
    name: string;
    unit: SoundUnit;

    constructor(uuid: string, name: string, unit: SoundUnit, isPublic: boolean) {
        this.uuid = uuid;
        this.name = name;
        this.unit = unit;
        this.isPublic = isPublic;
    }

}
