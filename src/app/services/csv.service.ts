import { Injectable } from '@angular/core';

@Injectable()
export class CsvService {
    private convertToCSV(objArray: any, columns: string[]) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        for (const obj of array) {
            let line = '';
            for (const col of columns) {
                if (line !== '') {
                    line += ',';
                }
                
                let item = obj[col];
                const type = typeof item;

                if (type === 'object') {
                    if (Array.isArray(array)) {
                        let string = ''
                        for (const i of item) {
                            if (string !== '') {
                                string += ';';
                            }
                            string += i;
                        }
                        line += '\"' + string + '\"';
                    }  
                } else if (typeof item === 'boolean') {
                    line += '\"' + (item ? 'Ano' : 'Ne') + '\"';
                } else if (typeof item === 'string') {
                    if (!item || item === '') {
                    item = '';
                    }
                    line += '\"' + item.replace(/\"/g, '""') + '\"';
                } else if (typeof item !== undefined && item != null) {
                    line += item;
                }
            }
            str += line + '\r\n';
        }
        return str;
    }
    private exportCSVFile(headers: any, columns: any, items: any, fileTitle: any) {
        let csv = '';
        if (headers) {
            csv = '"' + headers.join('","') + '"' + '\r\n';
        }
        const jsonObject = JSON.stringify(items);
        csv += this.convertToCSV(jsonObject, columns);
        const fileName = fileTitle + '.csv' || 'export.csv';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
// uuid
// title
// authors
// date
// url
// doctype
// context
// geonames
// licences
// pdf
// public
// selected
// sources

    public downloadTableAsCSV(data: any[], name: string) {
        let editedData = [];
        for (const record of data) {
            if (record.url) {
                record.url = location.protocol + '//' + location.host + record.url
            }
            editedData.push(record)
        }
        const colNames = ['UUID',
                          'Název', 
                          'Autoři', 
                          'Datum', 
                          'URL', 
                          'Typ dokumentu', 
                          'Geonames', 
                          'Licence', 
                          'PDF', 
                          'Veřejné', 
                          'Zdroje']; // Názvy sloupců v CSV
        const colIds = ['uuid', 
                        'title', 
                        'authors', 
                        'date', 
                        'url', 
                        'doctype', 
                        'geonames', 
                        'licences', 
                        'pdf', 
                        'public', 
                        'sources']; // Klíče objektu
        this.exportCSVFile(colNames, colIds, editedData, name);
    }

}