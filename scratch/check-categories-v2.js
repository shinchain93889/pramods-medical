
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

function extractCategory(name, uses, packSize) {
    const loweredUses = uses.toLowerCase();
    const loweredName = name.toLowerCase();
    const loweredPack = packSize.toLowerCase();

    if (loweredUses.includes('vitamin') || loweredUses.includes('supplement') || loweredUses.includes('nutrition') || loweredName.includes('multivitamin')) return 'Health Supplements';
    if (loweredUses.includes('first aid') || loweredName.includes('bandage') || loweredName.includes('antiseptic') || loweredName.includes('dettol') || loweredName.includes('savlon') || loweredPack.includes('bandage') || loweredPack.includes('gauze')) return 'First Aid';
    if (loweredName.includes('syrup') || loweredPack.includes('syrup') || loweredPack.includes('suspension') || loweredPack.includes('liquid') || loweredName.includes('expectorant')) return 'Syrups';
    if (loweredName.includes('tablet') || loweredPack.includes('tablet') || loweredPack.includes('strip of') || loweredName.includes('capsule') || loweredPack.includes('capsule')) return 'Tablets';

    if (loweredUses.includes('fever') || loweredUses.includes('pain')) return 'Fever & Pain';
    if (loweredUses.includes('diabetes')) return 'Diabetes';
    if (loweredUses.includes('skin') || loweredUses.includes('acne') || loweredName.includes('cream') || loweredName.includes('gel')) return 'Skin Care';
    if (loweredUses.includes('cough') || loweredUses.includes('cold')) return 'Cough & Cold';
    if (loweredUses.includes('bacterial') || loweredUses.includes('infection')) return 'Antibiotics';
    if (loweredUses.includes('heart') || loweredUses.includes('hypertension') || loweredUses.includes('cholesterol') || loweredUses.includes('blood pressure')) return 'Heart & Blood Pressure';
    if (loweredUses.includes('allerg') || loweredUses.includes('asthma')) return 'Allergy & Asthma';
    return 'General Care';
}

const filePath = path.join(process.cwd(), 'data', 'Merged_Medicine_Dataset.csv');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split(/\r?\n/);
const catSet = new Set();
const samples = { Tablets: [], Syrups: [], 'First Aid': [], 'Health Supplements': [] };

for(let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if(!line) continue;
    const cols = parseCSVRow(line);
    if (cols.length < 13) continue;
    const name = cols[0];
    const uses = cols[2];
    const pack = cols[12];
    const cat = extractCategory(name, uses, pack);
    catSet.add(cat);
    if (samples[cat] && samples[cat].length < 3) samples[cat].push(name);
}

console.log('Updated API Categories:', Array.from(catSet).sort());
console.log('Samples:', JSON.stringify(samples, null, 2));
