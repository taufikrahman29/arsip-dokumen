const fs = require('fs'); const t = fs.readFileSync('test-css.txt', 'utf8'); const start = t.indexOf('__vite__css = \') + 15; console.log(t.substring(start, start + 300));
