import { Injectable } from '@angular/core';
import { KrameriusApiService } from './kramerius-api.service';

@Injectable()
export class AltoService {



    constructor(private api: KrameriusApiService) {
    }

  getBoxes(alto: string, query: string, width: number, height: number): any[] {
    if (query.includes('~')) {
        query = query.substring(0, query.indexOf('~'));
    }
    const boxes: any[] = [];
    const wordArray = query.replace(/"/g, '').split(' ');

    // console.log('wordArray', wordArray);

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
                      let content = stringEl.getAttribute('CONTENT') || '';
                      const subsContent = stringEl.getAttribute('SUBS_CONTENT') || '';
                      const subsType = stringEl.getAttribute('SUBS_TYPE') || '';
                      if (subsType === 'HypPart1') {
                        content = subsContent
                      } else if (subsType === 'HypPart2') {
                        continue;
                      }
                      text += content + ' ';
                  }
              }
              // text += '\n';
          }
      }
  
      return text;
  }


  getFullText(alto: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(alto, "text/xml");
    let text = '';
    const textLines = Array.from(xmlDoc.getElementsByTagName('TextLine'));
    for (let textLine of textLines) {
        const hpos = parseInt(textLine.getAttribute('HPOS') || '0', 10);
        const vpos = parseInt(textLine.getAttribute('VPOS') || '0', 10);
        const textLineWidth = parseInt(textLine.getAttribute('WIDTH') || '0', 10);
        const textLineHeight = parseInt(textLine.getAttribute('HEIGHT') || '0', 10);
        const strings = Array.from(textLine.getElementsByTagName('String'));
        for (let stringEl of strings) {
            const stringHpos = parseInt(stringEl.getAttribute('HPOS') || '0', 10);
            const stringVpos = parseInt(stringEl.getAttribute('VPOS') || '0', 10);
            const stringWidth = parseInt(stringEl.getAttribute('WIDTH') || '0', 10);
            const stringHeight = parseInt(stringEl.getAttribute('HEIGHT') || '0', 10);
            let content = stringEl.getAttribute('CONTENT') || '';
            const subsContent = stringEl.getAttribute('SUBS_CONTENT') || '';
            const subsType = stringEl.getAttribute('SUBS_TYPE') || '';
            if (subsType === 'HypPart1') {
                content = subsContent
            } else if (subsType === 'HypPart2') {
                continue;
            }
            text += content + ' ';
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
    // console.log('aw', aw);  
    // console.log('ah', ah);

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
        // console.log('diff', diff);
        if (lastBottom > 0 && diff > 50) {
            if (block.text.length > 0) {
                block.text += '. -- -- ';
            }
            
            // if (block.text.length > 0) {
            //     blocks.push(block);
            // }
            // block = { text: '', hMin: 0, hMax: 0, vMin: 0, vMax: 0, width: aw, height: ah };
            // lines = 0;  
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
            // console.log(lines, block.text.length, content);
            if (lines >= 3 && block.text.length > 120 && (content.endsWith('.') || content.endsWith(';'))) {
                if (block.text.length > 0) {
                    blocks.push(block);
                }
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
    // console.log('blocks', blocks);
    return blocks;
}





getFormattedText(alto: string, uuid: string, width: number, height: number): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(alto, "text/xml");

    const page = xmlDoc.getElementsByTagName('Page')[0];
    const printSpace = xmlDoc.getElementsByTagName('PrintSpace')[0];
    if (!printSpace) {
        "";
    }
    let altoHeight = parseInt(page.getAttribute('HEIGHT') || '0', 10);
    let altoWidth = parseInt(page.getAttribute('WIDTH') || '0', 10);
    let altoHeight2 = parseInt(printSpace.getAttribute('HEIGHT') || '0', 10);
    let altoWidth2 = parseInt(printSpace.getAttribute('WIDTH') || '0', 10);
    let aw = 0;
    let ah = 0;
    if (altoHeight > 0 && altoWidth > 0) {
        aw = altoWidth;
        ah = altoHeight;
    } else if (altoHeight2 > 0 && altoWidth2 > 0) {
        aw = altoWidth2;
        ah = altoHeight2;
    }
    let wc = 1;
    let hc = 1;
    if (altoHeight > 0 && altoWidth > 0 && width > 0 && height > 0) {
        wc = width / altoWidth;
        hc = height / altoHeight;
    } else if (altoHeight2 > 0 && altoWidth2 > 0 && width > 0 && height > 0) {
        wc = width / altoWidth2;
        hc = height / altoHeight2;
    }




    let fonts = {};
    const styles = Array.from(xmlDoc.getElementsByTagName('TextStyle'));
    for (let style of styles) {
        const id = style.getAttribute('ID');
        const size = style.getAttribute('FONTSIZE');
        fonts[id] = parseInt(size, 10);
    }
    // console.log('-fonts', fonts);
    let blocks = [];
    
    const elements = xmlDoc.getElementsByTagName('*');

for (let i = 0; i < elements.length; i++) {
  const element = elements[i];
  const tagName = element.tagName;
    
  if (tagName === 'Illustration') {
    const hpos = parseInt(element.getAttribute('HPOS') || '0', 10) * wc;
    const vpos = parseInt(element.getAttribute('VPOS') || '0', 10) * hc;
    const width = parseInt(element.getAttribute('WIDTH') || '0', 10) * wc;
    const height = parseInt(element.getAttribute('HEIGHT') || '0', 10) * hc;
    const url = `${this.api.getIiifBaseUrl(uuid)}/${hpos},${vpos},${width},${height}/max/0/default.jpg`;
    // blocks.push({ text: `<img src="${url}" alt="illustration" />`, tag: 'div' });


  } else if (tagName === 'TextBlock') {
    let tag = 'p';
    const style = element.getAttribute('STYLEREFS');
    // console.log('-style', style);

    if (style && style.indexOf(' ') > 0) {
        const f = style.split(' ')[1];
        const size = fonts[f];
        if (size) {
            // console.log('-size', size);

            if (size > 18) {
                tag = 'h1';
            } else if (size > 11) {
                tag = 'h2';
            }
        }
    }
    let block = { text: '', tag: tag};
    const textLines = Array.from(element.getElementsByTagName('TextLine'));
    let lines = 0;
    let lastBottom = 0;
    let lastLeft = 0;
    let allBold = true;
    for (let textLine of textLines) {
        const textLineWidth = parseInt(textLine.getAttribute('WIDTH') || '0', 10);
        if (textLineWidth < 50) {
            continue;
        }
        const textLineHeight = parseInt(textLine.getAttribute('HEIGHT') || '0', 10);
        const textLineVpos = parseInt(textLine.getAttribute('VPOS') || '0', 10);
        const textLineHpos = parseInt(textLine.getAttribute('HPOS') || '0', 10);
        const bottom = textLineVpos + textLineHeight;
        const vDiff = textLineVpos  - lastBottom;
        if (lastBottom > 0 && vDiff > 40) {
            if (block.text.length > 0) {
                blocks.push(block);
            }
            block = { text: '', tag: tag};
            lines = 0;  
        }
        lastBottom = bottom;




        const hDiff = textLineHpos - lastLeft;
        // console.log('-- textLineHpos', textLineHpos);
        // console.log('-- lastLeft', lastLeft);
        // console.log('-- hDiff', hDiff);
        if (lastLeft > 0 && hDiff > 40) {
            if (block.text.length > 0) {
                blocks.push(block);
            }
            block = { text: '', tag: tag};
            lines = 0;  
        }
        lastLeft = textLineHpos;

        const strings = Array.from(textLine.getElementsByTagName('String'));
        for (let stringEl of strings) {
            const stringHpos = parseInt(stringEl.getAttribute('HPOS') || '0', 10);
            const stringVpos = parseInt(stringEl.getAttribute('VPOS') || '0', 10);
            const stringWidth = parseInt(stringEl.getAttribute('WIDTH') || '0', 10);
            const stringHeight = parseInt(stringEl.getAttribute('HEIGHT') || '0', 10);

            const style = stringEl.getAttribute('STYLE');
            // console.log('style', style);
            if (!style || style.indexOf('bold') < 0) {
                allBold = false;
            }

            let content = stringEl.getAttribute('CONTENT') || '';

            const subsContent = stringEl.getAttribute('SUBS_CONTENT') || '';
            const subsType = stringEl.getAttribute('SUBS_TYPE') || '';
            if (subsType === 'HypPart1') {
                content = subsContent
            } else if (subsType === 'HypPart2') {
                continue;
            }


            block.text += content;
            block.text += ' ';
        }  
        // console.log('===', lines, allBold, block.text.length, block.text);
        lines += 1;

        if (lines == 1 && allBold && block.text.length > 0) {
            block.tag = 'h3';
            blocks.push(block);
            block = { text: '', tag: tag};
            lines = 0;  
        } else {
            allBold = true;
        }
    }

    if (block.text.length > 0) {
        blocks.push(block);
    }
}



  }




    // console.log('blocks', blocks);
    let text = '';
    for (let block of blocks) {
        text += `<${block.tag}>${block.text}</${block.tag}>`;
    }
    return text;
}

}
