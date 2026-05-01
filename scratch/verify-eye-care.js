
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

    if (loweredUses.includes('glaucoma') || loweredUses.includes('ocular') || loweredName.includes('eye drop') || loweredPack.includes('eye drop') || loweredUses.includes('ophthalmic')) {
        return 'Eye Care';
    }

    if (loweredUses.includes('fever') || loweredUses.includes('pain')) return 'Fever & Pain';
    if (loweredUses.includes('diabetes')) return 'Diabetes';
    if (loweredUses.includes('skin') || loweredUses.includes('acne') || loweredName.includes('cream') || loweredName.includes('gel')) return 'Skin Care';
    if (loweredUses.includes('cough') || loweredUses.includes('cold')) return 'Cough & Cold';
    if (loweredUses.includes('bacterial') || loweredUses.includes('infection')) return 'Antibiotics';
    if (loweredUses.includes('heart') || loweredUses.includes('hypertension') || loweredUses.includes('cholesterol') || loweredUses.includes('blood pressure')) return 'Heart & Blood Pressure';
    if (loweredUses.includes('allerg') || loweredUses.includes('asthma')) return 'Allergy & Asthma';
    return 'General Care';
}

const namesToCheck = [
    "Abpress Eye Drop",
    "Alphagan P Eye Drop",
    "Abel-CT 40mg/12.5mg Tablet"
];

const usesToCheck = [
    "Treatment of Ocular hypertension Treatment of Glaucoma",
    "Treatment of Glaucoma",
    "Hypertension (high blood pressure)"
];

const packsToCheck = [
    "packet of 5 ml Eye Drop",
    "packet of 5 ml Eye Drop",
    "strip of 10 tablets"
];

for(let i=0; i<namesToCheck.length; i++) {
    console.log(`${namesToCheck[i]} -> ${extractCategory(namesToCheck[i], usesToCheck[i], packsToCheck[i])}`);
}
