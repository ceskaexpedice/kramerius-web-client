import { Injectable } from '@angular/core';

@Injectable()
export class AltoService {


    getBoxes(alto, query, width: number, height: number): any[] {
      // console.log(alto);
      const boxes = [];
      const wordArray = query.replace(/"/g, '').split(' ');
      const xmlString = alto.replace(/xmlns.*=".*"/g, '');
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


      for (let i = 0; i < wordArray.length; i++) {
        const word = wordArray[i].toLowerCase();
        const el = xml.find('String').filter(function() {
          return $(this).attr('CONTENT').toLowerCase().replace(/\-|\?|\!|\;|\)|\(|\.|„|“|"|,|\)/g, '') === word;
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
      // console.log('boxes', boxes);
      return boxes;
    }


  

  //             return boxes;
  //           },
  //           getTextInBox: function(xmlString, box, width, height) {
  //             var xmlDc = $.parseXML(xmlString);
  //             var xml = $(xmlDc);
  
  //             var printSpace = xml.find("Page");
  //             var altoHeight = parseInt(printSpace.attr('HEIGHT'));
  //             var altoWidth = parseInt(printSpace.attr('WIDTH'));
  
  //             var printSpace2 = xml.find("PrintSpace");
  //             var altoHeight2 = parseInt(printSpace2.attr('HEIGHT'));
  //             var altoWidth2 = parseInt(printSpace2.attr('WIDTH'));
  
  //             var wc = 1;
  //             var hc = 1;
  
  
  //             if(altoHeight > 0 && altoWidth > 0) {
  //               wc = width/altoWidth;
  //               hc = height/altoHeight;
  //             } else if(altoHeight2 > 0 && altoWidth2 > 0) {
  //               wc = width/altoWidth2;
  //               hc = height/altoHeight2;
  //             }
  
  
  
  
  //             var w1 = box[0]/wc;
  //             var w2 = box[2]/wc;
  //             var h1 = -box[3]/hc;
  //             var h2 = -box[1]/hc;
  //             var el = xml.find("String").filter(function() {
  //                 //return $(this).attr('CONTENT').toLowerCase().replace(/.|?|,|;|!|(|)/g, "") == word;
  //                 return parseInt($(this).attr('HPOS')) >= w1
  //                     && parseInt($(this).attr('HPOS')) + parseInt($(this).attr('WIDTH')) <= w2
  //                     && parseInt($(this).attr('VPOS')) >= h1
  //                     && parseInt($(this).attr('VPOS')) + parseInt($(this).attr('HEIGHT')) <= h2;
  //             });
  //             var text = '';
  //             el.each(function () {
  //                 var content = $(this).attr("CONTENT") + " ";
  //                 text+=content;
  //               });
  //             return text;
  
  //           }
  
  
  
  //         };
  // });




}
