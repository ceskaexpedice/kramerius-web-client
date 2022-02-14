import { SoundUnit } from './soundunit.model';
export class Track {

    uuid: string;
    isPublic: boolean;
    name: string;
    unit: SoundUnit;
    length: number;

    constructor(uuid: string, name: string, length: number, unit: SoundUnit, isPublic: boolean) {
        this.uuid = uuid;
        this.name = name;
        this.length = length;
        this.unit = unit;
        this.isPublic = isPublic;
    }

}
