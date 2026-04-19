const fs = require('fs');
const path = require('path');
const frontendSrc = path.join(__dirname, '../frontend/open_audit', 'src');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      content = content.replace(/\(import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/openaudit\.onrender\.com'\)/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000')");
      content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/openaudit\.onrender\.com'\}/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(frontendSrc);
console.log('Reverted frontend fallback back to localhost:5000');
