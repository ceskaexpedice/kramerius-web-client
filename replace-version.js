const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2]
const filesToReplace = ['src/index.html', 'src/app/static-page/static-page.component.html', 'src/app/app.module.ts']; // seznam souborů k nahrazení
const versionRegex = /v\d+\.\d+\.\d+(-dev)?/g; 

filesToReplace.forEach(file => {
  const filePath = path.join(__dirname, file);
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(versionRegex, `v${newVersion}`);

    fs.writeFile(filePath, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
});