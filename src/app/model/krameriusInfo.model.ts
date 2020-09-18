
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

}
