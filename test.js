const fs = require('fs');
const path = require('path');

function parseCSVRow(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let pos = 0; pos < text.length; pos++) {
        const char = text[pos];
        if (inQuotes) {
            if (char === '"') {
                if (pos + 1 < text.length && text[pos + 1] === '"') {
                    cur += '"';
                    pos++;
                } else {
                    inQuotes = false;
                }
            } else {
                cur += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(cur);
                cur = '';
            } else {
                cur += char;
            }
        }
    }
    result.push(cur);
    return result;
}

const filePath = path.join(process.cwd(), 'data', 'Medicine_Details.csv');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split(/\r?\n/);
console.log("Total lines:", lines.length);

const line = lines[1].trim();
const cols = parseCSVRow(line);
console.log("Cols length:", cols.length);
console.log("Name:", cols[0]);
console.log("Image:", cols[4]);
console.log("Uses:", cols[2]);
