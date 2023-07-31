import { Injectable } from '@angular/core';

@Injectable()
export class AltoService {


  getBoxes(alto: string, query: string, width: number, height: number): any[] {
    if (query.includes('~')) {
        query = query.substring(0, query.indexOf('~'));
    }
    const boxes: any[] = [];
    const wordArray = query.replace(/"/g, '').split(' ');

    console.log('wordArray', wordArray);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(alto, "text/xml");

    const page = xmlDoc.getElementsByTagName('Page')[0];
    const printSpace = xmlDoc.getElementsByTagName('PrintSpace')[0];

    let altoHeight = parseInt(page.getAttribute('HEIGHT') || '0', 10);
    let altoWidth = parseInt(page.getAttribute('WIDTH') || '0', 10);

    let altoHeight2 = parseInt(printSpace.getAttribute('HEIGHT') || '0', 10);
    let altoWidth2 = parseInt(printSpace.getAttribute('WIDTH') || '0', 10);

    let wc = 1;
    let hc = 1;
    if (altoHeight > 0 && altoWidth > 0) {
        wc = width / altoWidth;
        hc = height / altoHeight;
    } else if (altoHeight2 > 0 && altoWidth2 > 0) {
        wc = width / altoWidth2;
        hc = height / altoHeight2;
    }

    const strings = Array.from(xmlDoc.getElementsByTagName('String'));

    for (let word of wordArray) {
        word = word.toLowerCase().replace(/\-|\?|\!|»|«|\;|\)|\(|\.|„|“|"|,|\)/g, '');

        for (let stringEl of strings) {
            const content = stringEl.getAttribute('CONTENT')?.toLowerCase().replace(/\-|\?|\!|»|«|\;|\)|\(|\.|„|“|"|,|\)/g, '') || '';
            const subsContent = stringEl.getAttribute('SUBS_CONTENT')?.toLowerCase().replace(/\-|\?|\!|»|«|\;|\)|\(|\.|„|“|"|,|\)/g, '');

            if (content === word || subsContent === word) {
                const w = parseInt(stringEl.getAttribute('WIDTH') || '0', 10) * wc;
                const h = parseInt(stringEl.getAttribute('HEIGHT') || '0', 10) * hc;
                const vpos = parseInt(stringEl.getAttribute('VPOS') || '0', 10) * hc;
                const hpos = parseInt(stringEl.getAttribute('HPOS') || '0', 10) * wc;
                const box: any[] = [];
                box.push([hpos, -vpos]);
                box.push([hpos + w, -vpos]);
                box.push([hpos + w, -vpos - h]);
                box.push([hpos, -vpos - h]);
                box.push([hpos, -vpos]);
                boxes.push(box);
            }
        }
    }

    return boxes;
}


    getTextInBox(alto: string, box: number[], width: number, height: number): string {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(alto, "text/xml");
  
      const page = xmlDoc.getElementsByTagName('Page')[0];
      const printSpace = xmlDoc.getElementsByTagName('PrintSpace')[0];
  
      let altoHeight = parseInt(page.getAttribute('HEIGHT') || '0', 10);
      let altoWidth = parseInt(page.getAttribute('WIDTH') || '0', 10);
  
      let altoHeight2 = parseInt(printSpace.getAttribute('HEIGHT') || '0', 10);
      let altoWidth2 = parseInt(printSpace.getAttribute('WIDTH') || '0', 10);
  
      let wc = 1;
      let hc = 1;
  
      if (altoHeight > 0 && altoWidth > 0) {
          wc = width / altoWidth;
          hc = height / altoHeight;
      } else if (altoHeight2 > 0 && altoWidth2 > 0) {
          wc = width / altoWidth2;
          hc = height / altoHeight2;
      }
  
      const w1 = box[0] / wc;
      const w2 = box[2] / wc;
      const h1 = -box[3] / hc;
      const h2 = -box[1] / hc;
  
      let text = '';
      const textLines = Array.from(xmlDoc.getElementsByTagName('TextLine'));
  
      for (let textLine of textLines) {
          const hpos = parseInt(textLine.getAttribute('HPOS') || '0', 10);
          const vpos = parseInt(textLine.getAttribute('VPOS') || '0', 10);
          const textLineWidth = parseInt(textLine.getAttribute('WIDTH') || '0', 10);
          const textLineHeight = parseInt(textLine.getAttribute('HEIGHT') || '0', 10);
  
          if (hpos >= w1 && hpos + textLineWidth <= w2 && vpos >= h1 && vpos + textLineHeight <= h2) {
              const strings = Array.from(textLine.getElementsByTagName('String'));
  
              for (let stringEl of strings) {
                  const stringHpos = parseInt(stringEl.getAttribute('HPOS') || '0', 10);
                  const stringVpos = parseInt(stringEl.getAttribute('VPOS') || '0', 10);
                  const stringWidth = parseInt(stringEl.getAttribute('WIDTH') || '0', 10);
                  const stringHeight = parseInt(stringEl.getAttribute('HEIGHT') || '0', 10);
  
                  if (stringHpos >= w1 && stringHpos + stringWidth <= w2 && stringVpos >= h1 && stringVpos + stringHeight <= h2) {
                      const content = stringEl.getAttribute('CONTENT') || '';
                      text += content + ' ';
                  }
              }
              text += '\n';
          }
      }
  
      return text;
  }







  getBlocksForReading(alto: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(alto, "text/xml");

    const page = xmlDoc.getElementsByTagName('Page')[0];
    const printSpace = xmlDoc.getElementsByTagName('PrintSpace')[0];
    if (!printSpace) {
        return [];
    }

    let altoHeight = parseInt(page.getAttribute('HEIGHT') || '0', 10);
    let altoWidth = parseInt(page.getAttribute('WIDTH') || '0', 10);

    let altoHeight2 = parseInt(printSpace.getAttribute('HEIGHT') || '0', 10);
    let altoWidth2 = parseInt(printSpace.getAttribute('WIDTH') || '0', 10);

    // let wc = 1;
    // let hc = 1;

    let aw = 0;
    let ah = 0;
    if (altoHeight > 0 && altoWidth > 0) {
        // wc = width / altoWidth;
        // hc = height / altoHeight;
        aw = altoWidth;
        ah = altoHeight;
    } else if (altoHeight2 > 0 && altoWidth2 > 0) {
        // wc = width / altoWidth2;
        // hc = height / altoHeight2;
        aw = altoWidth2;
        ah = altoHeight2;
    }
    console.log('aw', aw);  
    console.log('ah', ah);

    let blocks = [];
    let block = { text: '', hMin: 0, hMax: 0, vMin: 0, vMax: 0, width: aw, height: ah };
    const textLines = Array.from(xmlDoc.getElementsByTagName('TextLine'));
    let lines = 0;
    let lastBottom = 0;
    for (let textLine of textLines) {
        const textLineWidth = parseInt(textLine.getAttribute('WIDTH') || '0', 10);
        if (textLineWidth < 50) {
            continue;
        }
        const textLineHeight = parseInt(textLine.getAttribute('HEIGHT') || '0', 10);
        const textLineVpos = parseInt(textLine.getAttribute('VPOS') || '0', 10);
        const bottom = textLineVpos + textLineHeight;
        const diff = textLineVpos  - lastBottom;
        console.log('diff', diff);
        if (lastBottom > 0 && diff > 50) {
            blocks.push(block);
            block = { text: '', hMin: 0, hMax: 0, vMin: 0, vMax: 0, width: aw, height: ah };
            lines = 0;  
        }
        lastBottom = bottom;
        lines += 1;
        const strings = Array.from(textLine.getElementsByTagName('String'));
        for (let stringEl of strings) {
            const stringHpos = parseInt(stringEl.getAttribute('HPOS') || '0', 10);
            const stringVpos = parseInt(stringEl.getAttribute('VPOS') || '0', 10);
            const stringWidth = parseInt(stringEl.getAttribute('WIDTH') || '0', 10);
            const stringHeight = parseInt(stringEl.getAttribute('HEIGHT') || '0', 10);
            if (block.hMin === 0 || block.hMin > stringHpos) {
                block.hMin = stringHpos;
            }
            if (block.hMax === 0 || block.hMax < stringHpos + stringWidth) {
                block.hMax = stringHpos + stringWidth;
            }
            if (block.vMin === 0 || block.vMin > stringVpos) {
                block.vMin = stringVpos;
            }
            if (block.vMax === 0 || block.vMax < stringVpos + stringHeight) {
                block.vMax = stringVpos + stringHeight;
            }
            const content = stringEl.getAttribute('CONTENT') || '';
            block.text += content;
            console.log(lines, block.text.length, content);
            if (lines >= 3 && block.text.length > 120 && (content.endsWith('.') || content.endsWith(';'))) {
                blocks.push(block);
                block = { text: '', hMin: 0, hMax: 0, vMin: 0, vMax: 0, width: aw, height: ah };
                lines = 0;  
            } else {
                block.text += ' ';
            }
        }    
    }
    if (block.text.length > 0) {
        blocks.push(block);
    }
    return blocks;
}


}
