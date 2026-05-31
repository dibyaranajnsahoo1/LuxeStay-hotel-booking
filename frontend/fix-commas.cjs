const fs = require('fs');
const path = require('path');

const indexCssPath = path.join(__dirname, 'src', 'index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf8');

// Use a regex to find all variable declarations in the form: `--color-.*: \d+, \d+, \d+;`
// and replace the commas with spaces.
indexCss = indexCss.replace(/(--color-[a-zA-Z0-9-]+:\s*\d+),\s*(\d+),\s*(\d+);/g, '$1 $2 $3;');

fs.writeFileSync(indexCssPath, indexCss);
console.log('Fixed CSS variable syntax in index.css');
