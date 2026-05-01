import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  composition?: string;
  sideEffects?: string;
  manufacturer?: string;
  packSize?: string;
  isDiscontinued?: boolean;
}

let cachedProducts: Product[] | null = null;
let allCategories: string[] = [];

// Custom CSV parser handling quoted commas safely
function parseCSVRow(text: string) {
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

function extractCategory(name: string, uses: string, packSize: string): string {
    const loweredUses = uses.toLowerCase();
    const loweredName = name.toLowerCase();
    const loweredPack = packSize.toLowerCase();

    // Check for Health Supplements
    if (loweredUses.includes('vitamin') || loweredUses.includes('supplement') || loweredUses.includes('nutrition') || loweredName.includes('multivitamin')) {
        return 'Health Supplements';
    }
    
    // Check for First Aid
    if (loweredUses.includes('first aid') || loweredName.includes('bandage') || loweredName.includes('antiseptic') || loweredName.includes('dettol') || loweredName.includes('savlon') || loweredPack.includes('bandage') || loweredPack.includes('gauze')) {
        return 'First Aid';
    }

    // Check for Syrups
    if (loweredName.includes('syrup') || loweredPack.includes('syrup') || loweredPack.includes('suspension') || loweredPack.includes('liquid') || loweredName.includes('expectorant')) {
        return 'Syrups';
    }

    // Check for Tablets
    if (loweredName.includes('tablet') || loweredPack.includes('tablet') || loweredPack.includes('strip of') || loweredName.includes('capsule') || loweredPack.includes('capsule')) {
        return 'Tablets';
    }

    // Check for Eye Care (Must be before Heart/Hypertension check)
    if (loweredUses.includes('glaucoma') || loweredUses.includes('ocular') || loweredName.includes('eye drop') || loweredPack.includes('eye drop') || loweredUses.includes('ophthalmic')) {
        return 'Eye Care';
    }

    // Functional categories
    if (loweredUses.includes('fever') || loweredUses.includes('pain')) return 'Fever & Pain';
    if (loweredUses.includes('diabetes')) return 'Diabetes';
    if (loweredUses.includes('skin') || loweredUses.includes('acne') || loweredName.includes('cream') || loweredName.includes('gel')) return 'Skin Care';
    if (loweredUses.includes('cough') || loweredUses.includes('cold')) return 'Cough & Cold';
    if (loweredUses.includes('bacterial') || loweredUses.includes('infection')) return 'Antibiotics';
    if (loweredUses.includes('heart') || loweredUses.includes('hypertension') || loweredUses.includes('cholesterol') || loweredUses.includes('blood pressure')) return 'Heart & Blood Pressure';
    if (loweredUses.includes('allerg') || loweredUses.includes('asthma')) return 'Allergy & Asthma';
    
    return 'General Care';
}

function loadData() {
    if (cachedProducts) return;
    
    // Using the new merged dataset
    const filePath = path.join(process.cwd(), 'data', 'Merged_Medicine_Dataset.csv');
    if (!fs.existsSync(filePath)) {
        console.warn("Dataset not found at:", filePath);
        cachedProducts = [];
        return;
    }
    
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);
        const products: Product[] = [];
        const catSet = new Set<string>();
        
        // CSV header: Medicine Name,Composition,Uses,Side_effects,Image URL,Manufacturer,Excellent Review %,Average Review %,Poor Review %,price(₹),Is_discontinued,manufacturer_name,pack_size_label,short_composition1,short_composition2
        for(let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if(!line) continue;
            
            const cols = parseCSVRow(line);
            // new dataset should have 15 columns
            if (cols.length < 15) continue;
            
            const name = cols[0].replace(/^"|"$/g, '').trim();
            const composition = cols[1].replace(/^"|"$/g, '').trim();
            const uses = cols[2].replace(/^"|"$/g, '').trim();
            const sideEffects = cols[3].replace(/^"|"$/g, '').trim();
            const image = cols[4].replace(/^"|"$/g, '').trim();
            const manufacturer = cols[5].replace(/^"|"$/g, '').trim();
            const priceVal = parseFloat(cols[9]) || 0;
            const discontinued = cols[10].toLowerCase() === 'true';
            const packSize = cols[12].replace(/^"|"$/g, '').trim();
            
            const cat = extractCategory(name, uses, packSize);
            catSet.add(cat);
            
            products.push({
                id: `med_${i}`,
                name: name,
                price: priceVal,
                category: cat,
                description: uses,
                image: image || `https://picsum.photos/seed/${i}/400/400`,
                composition: composition,
                sideEffects: sideEffects,
                manufacturer: manufacturer,
                packSize: packSize,
                isDiscontinued: discontinued
            });
        }
        
        cachedProducts = products;
        allCategories = Array.from(catSet).sort();
    } catch(err) {
        console.error("CSV Parsing Error:", err);
        cachedProducts = [];
    }
}

export async function GET(request: NextRequest) {
    loadData();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (searchParams.get('getCategories') === 'true') {
        return NextResponse.json({ categories: allCategories });
    }

    let filtered = cachedProducts || [];

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(s) || 
            p.description.toLowerCase().includes(s) ||
            p.composition?.toLowerCase().includes(s)
        );
    }
    
    if (minPrice) {
        const min = parseFloat(minPrice);
        filtered = filtered.filter(p => p.price >= min);
    }
    
    if (maxPrice) {
        const max = parseFloat(maxPrice);
        filtered = filtered.filter(p => p.price <= max);
    }

    if (sort === 'price_asc') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a,b) => b.price - a.price);
    else if (sort === 'name_asc') filtered.sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'name_desc') filtered.sort((a,b) => b.name.localeCompare(a.name));

    const from = (page - 1) * limit;
    const paginatedData = filtered.slice(from, from + limit);

    return NextResponse.json({
      data: paginatedData,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
}
