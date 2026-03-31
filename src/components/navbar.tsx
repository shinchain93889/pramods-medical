
"use client"

import Link from 'next/link';
import { ShoppingCart, Menu, Heart, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartDrawer } from './cart-drawer';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';

export function Navbar() {
  const { cart, itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 py-8">
                <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">Home</Link>
                <Link href="/products" className="text-lg font-semibold hover:text-primary transition-colors">Products</Link>
                <Link href="/prescription" className="text-lg font-semibold hover:text-primary transition-colors">Upload Prescription</Link>
                <Link href="/about" className="text-lg font-semibold hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="text-lg font-semibold hover:text-primary transition-colors">Contact</Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Heart className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary font-headline">Pramod Medical</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
          <Link href="/prescription" className="text-sm font-medium hover:text-primary transition-colors">Prescription</Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <CartDrawer>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartDrawer>
        </div>
      </div>
    </nav>
  );
}
