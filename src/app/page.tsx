
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { categories, products } from '@/lib/mock-data';
import { ProductCard } from '@/components/product-card';

export default function Home() {
  const heroImg = PlaceHolderImages.find(p => p.id === 'hero-medical');
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || 'https://picsum.photos/seed/medical1/1200/600'}
            alt="Pramod Medical Store"
            fill
            className="object-cover brightness-50"
            priority
            data-ai-hint="pharmacy interior"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white space-y-6">
            <span className="bg-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700">
              Trusted Since 1995
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              Your Health, <br /> Our Top Priority.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg animate-in fade-in slide-in-from-bottom-12 duration-700">
              Providing a wide range of authentic medicines, healthcare products, and professional advice for your well-being.
            </p>
            <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-700">
              <Link href="/products">
                <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">
                  Shop Now
                </Button>
              </Link>
              <Link href="/prescription">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md border-white/20 hover:bg-white text-primary">
                  Upload Prescription
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: ShieldCheck, title: "100% Authentic", desc: "Genuine medicines only" },
            { icon: Truck, title: "Fast Delivery", desc: "Same day home delivery" },
            { icon: Clock, title: "24/7 Support", desc: "Always here for you" },
            { icon: Award, title: "Best Prices", desc: "High quality, low costs" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow group">
              <div className="bg-accent p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline text-primary">Browse Categories</h2>
            <p className="text-muted-foreground">Find what you need by browsing our specialized departments.</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="gap-2 group">
              View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const img = PlaceHolderImages.find(p => p.id === cat.image);
            return (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src={img?.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  data-ai-hint={img?.imageHint || 'medical category'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline text-primary">Featured Products</h2>
            <p className="text-muted-foreground">Our most popular healthcare solutions and medicines.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Prescription CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-primary rounded-3xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Quick Order with <br /> Prescription
              </h2>
              <p className="text-white/80 text-lg">
                Upload your doctor's prescription and we'll handle the rest. Our experts will verify and package your medicine for quick delivery.
              </p>
              <Link href="/prescription" className="inline-block">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold shadow-lg">
                  Upload Now
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block relative h-[300px]">
              <div className="bg-white p-6 rounded-2xl shadow-2xl rotate-3 absolute inset-0 max-w-sm mx-auto flex flex-col items-center justify-center text-center gap-4">
                 <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                   <ShieldCheck className="h-8 w-8 text-secondary" />
                 </div>
                 <h4 className="font-bold text-xl text-primary">Secure Upload</h4>
                 <p className="text-muted-foreground text-sm">Your medical records are encrypted and kept private with us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
