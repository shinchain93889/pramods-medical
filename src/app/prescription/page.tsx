
"use client"

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/mock-data';
import { prescribeAiRecommendations, PrescriptionAiRecommendationsOutput } from '@/ai/flows/prescription-ai-recommendations-flow';
import { ProductCard } from '@/components/product-card';
import { toast } from '@/hooks/use-toast';

export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<PrescriptionAiRecommendationsOutput['suggestedProducts']>([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.name || !formData.phone) {
      toast({ title: "Error", description: "Please fill all fields and upload a prescription.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert file to data URI for Genkit
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        
        const response = await prescribeAiRecommendations({
          prescriptionImageDataUri: dataUri,
          storeInventory: products.map(p => ({ id: p.id, name: p.name, price: p.price }))
        });

        setSuggestedProducts(response.suggestedProducts);
        setIsAnalyzing(false);
        toast({
          title: "Prescription Analyzed!",
          description: "We've identified possible matches in our inventory.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      toast({ title: "Error", description: "Failed to analyze prescription.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-primary font-headline">Prescription Upload</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Skip the hassle. Upload a photo of your prescription, and our AI will help identify the medicines we have in stock for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card className="shadow-xl border-primary/10 overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter full name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="e.g. +91 9876543210" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Upload Prescription Image</Label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-secondary bg-secondary/5' : 'border-muted-foreground/20 hover:border-primary hover:bg-primary/5'}`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-10 w-10 text-secondary" />
                      <p className="font-medium text-sm">{file.name}</p>
                      <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change file</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-10 w-10 mb-2" />
                      <p className="font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              <Button className="w-full h-12 text-lg font-bold" disabled={isAnalyzing}>
                {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Submit & Analyze"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              How it works
            </h3>
            <ul className="space-y-4">
              {[
                "Take a clear photo of your doctor's prescription.",
                "Fill in your details so we can reach out.",
                "Our AI scans the image to find matching medicines.",
                "Add found medicines to your cart and checkout."
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent text-secondary text-[10px] font-bold shrink-0">{i+1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {suggestedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-secondary font-bold">
                <Sparkles className="h-5 w-5 fill-current" />
                <span>AI Suggested Products</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedProducts.map(suggestion => {
                   const fullProduct = products.find(p => p.id === suggestion.id);
                   return fullProduct ? <ProductCard key={fullProduct.id} product={fullProduct} /> : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
