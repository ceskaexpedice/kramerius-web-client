
export class KrameriusInfo {
  version: string;
  rightMsg: string;
  intro: string;
  pdfMaxRange: number;

  static fromJson(json): KrameriusInfo {
    if (json) {
      const info = new KrameriusInfo();
      info.rightMsg = json['rightMsg'];
      info.intro = json['intro'];
      info.pdfMaxRange = json['pdfMaxRange'];
      info.version = json['version'];
      return info;
    }
    return null;
  }


  getRightMessage(): string {
    if (!this.rightMsg) {
      return "";
    }
    const uuid = this.getUuidFromUrl();
    return this.rightMsg.replace(/\${UUID}/g, uuid);
  }

  private getUuidFromUrl() {
    const path = location.pathname;
    const query = location.search;
    let uuid = "";
    if (path.indexOf('uuid:') > -1) {
      uuid = path.substr(path.indexOf('uuid:'));
    }
    if (query.indexOf('article=uuid:') > -1) {
      uuid = this.parseUuid(query, 'article');
    }
    if (query.indexOf('page=uuid:') > -1) {
      uuid = this.parseUuid(query, 'page');
    }
    return uuid;
  }

  private parseUuid(query: string, param: string) {
    for (const p of query.split('&')) {
      if (p.indexOf(param + '=') > -1) {
        return p.substring(p.indexOf(param + '=') + param.length + 1);
      }
    }
  }


}
