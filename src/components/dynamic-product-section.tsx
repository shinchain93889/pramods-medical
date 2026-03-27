"use client"

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/mock-data';
import { Loader2, Search } from 'lucide-react';

export function DynamicProductSection() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [categories, setCategories] = useState<string[]>(['Antibiotics', 'Cough & Cold', 'Diabetes', 'Fever & Pain', 'Skin Care']);

  useEffect(() => {
    fetch('/api/medicines?getCategories=true')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    let isMounted = true;
    
    const fetchCategory = async () => {
      setLoading(true);
      setPage(1);
      try {
        const query = new URLSearchParams({
          category: activeCategory,
          page: '1',
          limit: '20',
          ...(searchTerm && { search: searchTerm }),
          ...(sort && { sort: sort }),
          ...(minPrice && { minPrice: minPrice }),
          ...(maxPrice && { maxPrice: maxPrice })
        });
        
        const res = await fetch(`/api/medicines?${query.toString()}`);
        const data = await res.json();
        if (isMounted) {
          setProducts(data.data || []);
          setHasMore(data.meta?.page < data.meta?.totalPages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchCategory();
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [activeCategory, searchTerm, sort, minPrice, maxPrice]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !activeCategory) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const query = new URLSearchParams({
        category: activeCategory,
        page: nextPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(sort && { sort: sort }),
        ...(minPrice && { minPrice: minPrice }),
        ...(maxPrice && { maxPrice: maxPrice })
      });
      const res = await fetch(`/api/medicines?${query.toString()}`);
      const data = await res.json();
      setProducts(prev => [...prev, ...(data.data || [])]);
      setHasMore(data.meta?.page < data.meta?.totalPages);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8" id="products">
      <div className="flex flex-col mb-10 gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-headline text-primary">Dynamic Products Catalog</h2>
          <p className="text-muted-foreground">Select a category below to instantly load our medicines matching your needs.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background hover:bg-muted border-input text-foreground'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        {activeCategory && (
          <div className="flex flex-col lg:flex-row gap-4 p-5 border border-border/50 rounded-2xl bg-muted/20 items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Price:</span>
                <input 
                  type="number" 
                  placeholder="Min ₹" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <span className="text-muted-foreground">-</span>
                <input 
                  type="number" 
                  placeholder="Max ₹" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
              >
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Product Display Area */}
      {!activeCategory ? (
        <div className="py-24 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/10">
          <p className="text-xl font-medium text-muted-foreground">Select a category above to load products.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="animate-pulse bg-muted/30 border border-border/50 rounded-xl h-[380px]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button onClick={loadMore} disabled={loadingMore} size="lg" variant="outline" className="px-8 rounded-full border-2">
                {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Load More Products'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center border border-border/50 rounded-3xl bg-background shadow-sm">
          <p className="text-xl font-medium text-foreground mb-2">No products found</p>
          <p className="text-muted-foreground">Try adjusting your search criteria or price range.</p>
        </div>
      )}
    </section>
  );
}
