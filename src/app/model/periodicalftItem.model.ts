
export class PeriodicalFtItem {
    volume: string;
    issue: string;
    page: string;
    date: string;
    year: string;
    part: string;
    title: string;
    issueUuid: string;
    volumeUuid: string;
    uuid: string;
    public: boolean;
    thumb: string;
    text: string;
    query: string;
    isMonographUnit = false;

    constructor() {
    }

    getUrl(): string {
        return '/view/' + this.issueUuid;
    }

}
