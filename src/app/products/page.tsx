
"use client"

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { products, categories } from '@/lib/mock-data';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contextualProductRecommendations, ContextualProductRecommendationsOutput } from '@/ai/flows/contextual-product-recommendations-flow';
import { useCart } from '@/hooks/use-cart';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const { cart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [recommendations, setRecommendations] = useState<ContextualProductRecommendationsOutput['recommendations']>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  useEffect(() => {
    async function getAiRecommendations() {
      if (cart.length > 0) {
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
      }
    }
    getAiRecommendations();
  }, [cart]);

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
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className="rounded-full"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* AI Recommendations Bar */}
      {recommendations.length > 0 && (
        <div className="bg-accent/50 p-6 rounded-2xl border border-secondary/20 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-secondary font-bold">
            <Sparkles className="h-5 w-5 fill-current" />
            <span>Smart Recommendations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-1">
                <h4 className="font-bold text-sm">{rec.productName}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
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
