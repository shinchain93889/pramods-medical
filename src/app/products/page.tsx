"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/mock-data';
import { contextualProductRecommendations, ContextualProductRecommendationsOutput } from '@/ai/flows/contextual-product-recommendations-flow';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const { cart } = useCart();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [recommendations, setRecommendations] = useState<ContextualProductRecommendationsOutput['recommendations']>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/medicines?getCategories=true')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setPage(1);
      try {
        const query = new URLSearchParams({
          page: '1',
          limit: '20',
          ...(selectedCategory && { category: selectedCategory }),
          ...(search && { search: search })
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
    
    const debounceTimer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, search]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
        const query = new URLSearchParams({
          page: nextPage.toString(),
          limit: '20',
          ...(selectedCategory && { category: selectedCategory }),
          ...(search && { search: search })
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

  useEffect(() => {
    async function getAiRecommendations() {
      if (cart.length > 0 && products.length > 0) {
        setIsAiLoading(true);
        try {
          const res = await contextualProductRecommendations({
            cartItems: cart.map(i => i.name),
            allAvailableProducts: products.map(p => p.name)
          });
          setRecommendations(res.recommendations);
        } catch (error) {
          console.error("AI Recommendation Error:", error);
        } finally {
          setIsAiLoading(false);
        }
      } else {
        setRecommendations([]);
      }
    }
    const timer = setTimeout(getAiRecommendations, 1000);
    return () => clearTimeout(timer);
  }, [cart, products]);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-primary font-headline">Medical Catalog</h1>
          <p className="text-muted-foreground">Browse through our wide variety of authentic medicines.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search medicines, syrups, etc..."
            className="pl-10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
        >
          All Items
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* AI Recommendations Bar */}
      {(recommendations.length > 0 || isAiLoading) && cart.length > 0 && (
        <div className="bg-accent/50 p-6 rounded-2xl border border-secondary/20 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-secondary font-bold">
            <Sparkles className="h-5 w-5 fill-current" />
            <span>Smart Recommendations {isAiLoading && <Loader2 className="inline ml-2 h-4 w-4 animate-spin text-muted-foreground" />}</span>
          </div>
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-1">
                  <h4 className="font-bold text-sm">{rec.productName}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="animate-pulse bg-muted/30 border border-border/50 rounded-xl h-[380px]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button onClick={loadMore} disabled={loadingMore} size="lg" variant="outline" className="px-8 rounded-full border-2">
                {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Load More Products'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No medicines found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
