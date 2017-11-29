export class Page {

    // Page Properties
    uuid: string;
    policy: string;
    type: string;
    number: string;
    index: number;
    thumb: string;

    // Image Properties
    width: number;
    height: number;
    url: string;

    constructor() {

    }

    public setImageProperties(width: number, height: number, url: string) {
        this.width = width;
        this.height = height;
        this.url = url;
    }

    public hasImageData() {
        return this.width && this.height && this.url;
    }

}
