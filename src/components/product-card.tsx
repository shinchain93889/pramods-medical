
"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ProductCard({ product }: { product: Product }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addToCart } = useCart();
  const imgData = PlaceHolderImages.find(p => p.id === product.image);
  
  const imageUrl = imgData?.imageUrl || product.image || `https://picsum.photos/seed/${product.id}/400/400`;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your bag.`,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card 
        className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer flex flex-col h-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <div 
          className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={imgData?.imageHint || 'medicine box'}
            onClick={() => setIsDialogOpen(true)}
          />
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
              {product.category}
            </span>
          </div>
        </div>
        <CardHeader className="p-4 pb-0 space-y-1">
          <CardTitle className="text-base line-clamp-1" title={product.name}>{product.name}</CardTitle>
          <div className="flex flex-col gap-0.5">
            {product.manufacturer && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight line-clamp-1">{product.manufacturer}</p>
            )}
            {product.composition && (
              <p className="text-[11px] font-medium text-primary/80 line-clamp-1" title={product.composition}>
                {product.composition}
              </p>
            )}
            {product.packSize && (
              <p className="text-[10px] font-semibold text-secondary-foreground/70">{product.packSize}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2" title={product.description}>{product.description}</p>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-grow">
          <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button onClick={handleAddToCart} className="w-full gap-2 group/btn">
            <Plus className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-[500px] h-[80vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary font-headline">{product.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <DialogDescription className="uppercase tracking-wider font-semibold text-xs py-1 px-2 bg-muted rounded">
              {product.category}
            </DialogDescription>
            {product.packSize && (
              <span className="text-[11px] font-bold text-secondary-foreground bg-secondary/20 px-2 py-1 rounded">
                {product.packSize}
              </span>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-48 w-48 sm:h-56 sm:w-56 object-cover rounded-2xl border border-secondary/20 shadow-md"
            />
          </div>
          
          <div className="space-y-4">
            {product.manufacturer && (
              <div className="px-1">
                <h4 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Manufacturer</h4>
                <p className="text-sm font-semibold text-foreground italic">{product.manufacturer}</p>
              </div>
            )}

            {product.composition && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <h4 className="font-bold text-sm text-foreground mb-1">Composition</h4>
                <p className="text-sm text-muted-foreground">{product.composition}</p>
              </div>
            )}
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <h4 className="font-bold text-sm text-foreground mb-1">Uses</h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
            
            {product.sideEffects && (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 dark:bg-rose-950/20 dark:border-rose-900/30">
                <h4 className="font-bold text-sm text-red-600 dark:text-rose-400 mb-1">Side Effects</h4>
                <p className="text-sm text-muted-foreground">{product.sideEffects}</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex items-center justify-between border-t border-border/50">
            <p className="text-3xl font-black text-primary">₹{product.price.toFixed(2)}</p>
            <Button size="lg" onClick={() => {
               setIsDialogOpen(false);
               handleAddToCart();
            }} className="gap-2 shadow-xl shadow-primary/20">
              <Plus className="h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
