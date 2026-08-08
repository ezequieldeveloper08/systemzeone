import fs from 'fs';
const content = fs.readFileSync('scratch/output.css', 'utf8');

function showContext(target) {
  let pos = content.indexOf(target);
  if (pos === -1) {
    console.log(`${target} not found`);
    return;
  }
  console.log(`--- Context for ${target} ---`);
  let start = Math.max(0, pos - 100);
  let end = Math.min(content.length, pos + 100);
  console.log(content.substring(start, end));
}

showContext('flex-col');
