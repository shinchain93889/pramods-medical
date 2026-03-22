
"use client"

import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { cart, removeFromCart, total, clearCart } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => {
                const imgData = PlaceHolderImages.find(p => p.id === item.image);
                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={imgData?.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">₹{item.price.toFixed(2)} x {item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="border-t pt-6">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">Checkout Now</Button>
              <Button variant="ghost" className="w-full text-xs" onClick={clearCart}>Clear Cart</Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
