
"use client"

import Image from 'next/image';
import { Product } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const imgData = PlaceHolderImages.find(p => p.id === product.image);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your bag.`,
    });
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imgData?.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-110"
          data-ai-hint={imgData?.imageHint || 'medicine box'}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full gap-2 group/btn">
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
