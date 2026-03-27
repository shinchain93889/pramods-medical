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

function extractCategory(uses: string): string {
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

function loadData() {
    if (cachedProducts) return;
    
    const filePath = path.join(process.cwd(), 'data', 'Medicine_Details.csv');
    if (!fs.existsSync(filePath)) {
        cachedProducts = [];
        return;
    }
    
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);
        const products: Product[] = [];
        const catSet = new Set<string>();
        
        // Assuming CSV header: Medicine Name, Composition, Uses, Side_effects, Image URL, Manufacturer, Reviews...
        for(let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if(!line) continue;
            
            const cols = parseCSVRow(line);
            if (cols.length < 6) continue;
            
            const name = cols[0];
            const uses = cols[2];
            const image = cols[4];
            
            const cat = extractCategory(uses);
            catSet.add(cat);
            
            // Deterministic price fallback mock since CSV lacks Price column
            const priceIndicator = ((name.length * 23) % 850) + 20;
            
            products.push({
                id: `med_${i}`,
                name: name.replace(/^"|"$/g, ''),
                price: priceIndicator,
                category: cat,
                description: uses.replace(/^"|"$/g, ''),
                image: image.replace(/^"|"$/g, '') || `https://picsum.photos/seed/${i}/400/400`
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
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s));
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
