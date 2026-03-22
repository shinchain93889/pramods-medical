
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Users, ShieldCheck, Award } from 'lucide-react';

export default function AboutPage() {
  const shopImg = PlaceHolderImages.find(p => p.id === 'about-shop');

  return (
    <div className="flex flex-col gap-24 pb-20">
      <section className="bg-primary py-20 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline">Our Story</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Dedicated to providing quality healthcare solutions to our community for over 25 years.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={shopImg?.imageUrl || ''}
              alt="Pramod Medical Store Front"
              fill
              className="object-cover"
              data-ai-hint="medical store interior"
            />
          </div>
          <div className="space-y-6">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm">Since 1995</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-headline">A Legacy of Care and Trust</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded by Mr. Pramod Sharma in 1995, Pramod Medical Store started as a small neighborhood pharmacy with a big vision: to make essential healthcare accessible and affordable for everyone in Jaipur.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve thousands of customers daily, providing not just medicines, but hope and support for a healthier life. Our team of certified pharmacists ensures that every product on our shelves is authentic and stored under optimal conditions.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="text-4xl font-extrabold text-secondary">25+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Years Experience</p>
              </div>
              <div>
                <h4 className="text-4xl font-extrabold text-secondary">50k+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Happy Families</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-accent/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-primary font-headline">Our Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The core principles that drive us to serve you better every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Authenticity", desc: "We source directly from authorized distributors." },
              { icon: Heart, title: "Compassion", desc: "Your health journey is personal to us." },
              { icon: Users, title: "Community", desc: "Growing and thriving together with Jaipur." },
              { icon: Award, title: "Excellence", desc: "Committed to the highest standards of service." }
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center space-y-4 border border-border/50">
                <div className="bg-accent w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-xl">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
