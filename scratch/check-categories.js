
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

function extractCategory(uses) {
    const lowered = uses.toLowerCase();
    if (lowered.includes('fever') || lowered.includes('pain')) return 'Fever & Pain';
    if (lowered.includes('diabetes')) return 'Diabetes';
    if (lowered.includes('skin') || lowered.includes('acne')) return 'Skin Care';
    if (lowered.includes('cough') || lowered.includes('cold')) return 'Cough & Cold';
    if (lowered.includes('bacterial') || lowered.includes('infection')) return 'Antibiotics';
    if (lowered.includes('heart') || lowered.includes('hypertension') || lowered.includes('cholesterol') || lowered.includes('blood pressure')) return 'Heart & Blood Pressure';
    if (lowered.includes('vitamin') || lowered.includes('supplement') || lowered.includes('nutrition')) return 'Vitamins & Supplements';
    if (lowered.includes('allerg') || lowered.includes('asthma')) return 'Allergy & Asthma';
    return 'General Care';
}

const filePath = path.join(process.cwd(), 'data', 'Merged_Medicine_Dataset.csv');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split(/\r?\n/);
const catSet = new Set();

for(let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if(!line) continue;
    const cols = parseCSVRow(line);
    if (cols.length < 3) continue;
    catSet.add(extractCategory(cols[2]));
}

console.log('Current API Categories:', Array.from(catSet).sort());
