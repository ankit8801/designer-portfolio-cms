import fs from 'fs';
import path from 'path';

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('./src', /\.jsx$/);

let totalReplaced = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('transition-all')) {
    // Replace standalone transition-all with transition
    const newContent = content.replace(/\btransition-all\b/g, 'transition');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      totalReplaced++;
      console.log(`Updated ${file}`);
    }
  }
}

console.log(`\nReplaced transition-all in ${totalReplaced} files.`);
