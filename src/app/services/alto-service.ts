import { Injectable } from '@angular/core';

declare var $: any;

@Injectable()
export class AltoService {


    getBoxes(alto, query, width: number, height: number): any[] {
      if (query.indexOf('~') > -1) {
        query = query.substring(0, query.indexOf('~'));
      } 
      const boxes = [];
      const wordArray = query.replace(/"/g, '').split(' ');

      console.log('wordArray', wordArray);

      const xmlString = alto; // .replace(/xmlns.*=".*"/g, '');
      let xml;
      try {
        xml = $($.parseXML(xmlString));
      } catch (err) {
        return [];
      }
      const printSpace = xml.find('Page');
      const altoHeight = parseInt(printSpace.attr('HEIGHT'), 10);
      const altoWidth = parseInt(printSpace.attr('WIDTH'), 10);
      const printSpace2 = xml.find('PrintSpace');
      const altoHeight2 = parseInt(printSpace2.attr('HEIGHT'), 10);
      const altoWidth2 = parseInt(printSpace2.attr('WIDTH'), 10);

      let wc = 1;
      let hc = 1;
      if (altoHeight > 0 && altoWidth > 0) {
        wc = width / altoWidth;
        hc = height / altoHeight;
      } else if (altoHeight2 > 0 && altoWidth2 > 0) {
        wc = width / altoWidth2;
        hc = height / altoHeight2;
      }

      for (let i = 0; i < wordArray.length; i++) {
        const word = wordArray[i].toLowerCase().replace(/\-|\?|\!|»|«|\;|\)|\(|\.|„|“|"|,|\)/g, '');
        const el = xml.find('String').filter(function() {
          return $(this).attr('CONTENT').toLowerCase().replace(/\-|\?|\!|»|«|\;|\)|\(|\.|„|“|"|,|\)/g, '') === word;
        });
        if (!el) {
          return;
        }
        el.each(function () {
          const w = parseInt($(this).attr('WIDTH'), 10) * wc;
          const h = parseInt($(this).attr('HEIGHT'), 10) * hc;
          const vpos = parseInt($(this).attr('VPOS'), 10) * hc;
          const hpos = parseInt($(this).attr('HPOS'), 10) * wc;
          const box = [];
          box.push([hpos, -vpos]);
          box.push([hpos + w, -vpos]);
          box.push([hpos + w, -vpos - h]);
          box.push([hpos, -vpos - h]);
          box.push([hpos, -vpos]);
          boxes.push( box);
        });

      }
      return boxes;
    }


    getTextInBox(alto, box, width: number, height: number) {
      const xmlString = alto;
      const xml = $($.parseXML(xmlString));

      const printSpace = xml.find('Page');
      const altoHeight = parseInt(printSpace.attr('HEIGHT'), 10);
      const altoWidth = parseInt(printSpace.attr('WIDTH'), 10);

      const printSpace2 = xml.find('PrintSpace');
      const altoHeight2 = parseInt(printSpace2.attr('HEIGHT'), 10);
      const altoWidth2 = parseInt(printSpace2.attr('WIDTH'), 10);

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
      const el = xml.find('String').filter(function() {
          return parseInt($(this).attr('HPOS'), 10) >= w1
              && parseInt($(this).attr('HPOS'), 10) + parseInt($(this).attr('WIDTH'), 10) <= w2
              && parseInt($(this).attr('VPOS'), 10) >= h1
              && parseInt($(this).attr('VPOS'), 10) + parseInt($(this).attr('HEIGHT'), 10) <= h2;
      });
      let text = '';
      el.each(function () {
          const content = $(this).attr('CONTENT') + ' ';
          text += content;
        });
      return text;

    }

}
