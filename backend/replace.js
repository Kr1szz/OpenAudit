const fs = require('fs');
const path = require('path');
const frontendSrc = path.join(__dirname, '../frontend/open_audit', 'src');

const backendSrc = path.join(__dirname, 'index.js');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Replace hardcoded strings in axios.get('http://localhost:5000/api/...')
      content = content.replace(/'http:\/\/localhost:5000\/(.*?)'/g, "(import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com') + '/$1'");
      
      // Replace template literals in axios.get(`http://localhost:5000/api/...`)
      content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL || 'https://openaudit.onrender.com'}");
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(frontendSrc);
console.log('Replaced localhost:5000 in frontend');

// Backend index.js origin update
let backendContent = fs.readFileSync(backendSrc, 'utf8');
backendContent = backendContent.replace(/origin: 'http:\/\/localhost:5173',/g, "origin: (origin, callback) => callback(null, true),");
fs.writeFileSync(backendSrc, backendContent);
console.log('Replaced localhost:5173 in backend');
