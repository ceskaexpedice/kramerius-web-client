import { Metadata } from "./metadata.model";

export class SoundUnit {

    uuid: string;
    name: string;
    metadata: Metadata;

    constructor(uuid: string, name: string) {
        this.uuid = uuid;
        this.name = name;
    }

}
