
"use client"

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate EmailJS sending
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col gap-20">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline">Get in Touch</h1>
        <p className="text-lg text-muted-foreground">
          Have questions about a medicine? Need to check stock availability? Our team is ready to help you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold">Call Us</h4>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                <p className="text-sm text-muted-foreground">+91 141 123456</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-sm text-muted-foreground">contact@pramodmedical.com</p>
                <p className="text-sm text-muted-foreground">support@pramodmedical.com</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-bold">Our Location</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Main Market Road, Opp. Civil Hospital, Jaipur, Rajasthan 302001, India
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full rounded-2xl overflow-hidden border shadow-inner">
             {/* Mock Map Iframe - in production, use a proper Google Maps component */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113896.46313460628!2d75.71388836263435!3d26.885447917714856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-primary font-headline mb-8">Send us a Message</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full Name</Label>
                <Input id="contact-name" placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email Address</Label>
                <Input id="contact-email" type="email" placeholder="name@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input id="contact-subject" placeholder="What is this about?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" placeholder="Write your message here..." className="min-h-[150px]" required />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : <><Send className="h-5 w-5" /> Send Message</>}
            </Button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 border-secondary text-secondary hover:bg-secondary hover:text-white font-bold gap-2"
              onClick={() => window.open('https://wa.me/919876543210', '_blank')}
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
