"use client"

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, MapPin, MessageSquare, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { products } from '@/lib/mock-data';
import { prescribeAiRecommendations, PrescriptionAiRecommendationsOutput } from '@/ai/flows/prescription-ai-recommendations-flow';
import { ProductCard } from '@/components/product-card';
import { toast } from '@/hooks/use-toast';
import { savePrescriptionOrder } from './actions';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState<PrescriptionAiRecommendationsOutput['suggestedProducts']>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.type === 'application/pdf') {
      setPreview('/pdf-placeholder.png'); // You can use a generic PDF icon
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast({ title: "Invalid File", description: "Only JPG, PNG, and PDF are supported.", variant: "destructive" });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setSuggestedProducts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Upload Required", description: "Please upload your prescription before placing an order.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('extra_notes', formData.notes);
      data.append('prescription', file);

      setUploadProgress(40);

      // 1. Save to Database and Storage
      const result = await savePrescriptionOrder(data);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setUploadProgress(70);

      // 2. Perform AI Analysis (Optional bonus from before)
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUri = reader.result as string;
          const aiResponse = await prescribeAiRecommendations({
            prescriptionImageDataUri: dataUri,
            storeInventory: products.map(p => ({ id: p.id, name: p.name, price: p.price }))
          });
          setSuggestedProducts(aiResponse.suggestedProducts);
          setUploadProgress(100);
          setIsSuccess(true);
          toast({ title: "Success!", description: "Order placed and prescription analyzed." });
          setIsUploading(false);
        } catch (err) {
          setUploadProgress(100);
          setIsSuccess(true);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error(error);
      setIsUploading(false);
      toast({ title: "Upload Failed", description: error.message || "Failed to upload prescription.", variant: "destructive" });
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-primary/10 flex flex-col items-center gap-6">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold font-headline">Order Placed Successfully!</h1>
          <p className="text-muted-foreground">
            Thank you, <strong>{formData.name}</strong>. Our pharmacists will review your prescription and process your order shortly. A confirmation message will be sent to <strong>{formData.phone}</strong>.
          </p>
          {suggestedProducts.length > 0 && (
            <div className="w-full pt-8 space-y-4">
              <p className="text-sm font-bold text-secondary flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Identified these medicines in our store:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedProducts.map(s => {
                  const p = products.find(prod => prod.id === s.id);
                  return p ? <ProductCard key={p.id} product={p} /> : null;
                })}
              </div>
            </div>
          )}
          <div className="flex gap-4 pt-6">
            <Button onClick={() => window.location.reload()}>Upload Another</Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline tracking-tight">
          Prescription Upload
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Fast, secure, and reliable. Upload your prescription to order medicines from the comfort of your home.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <Card className="shadow-2xl border-primary/5 overflow-hidden rounded-3xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Patient's Full Name</Label>
                    <div className="relative">
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required 
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold">Mobile Number</Label>
                    <div className="relative">
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+91 98765-43210" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required 
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter full delivery address with landmark" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required 
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold">Upload Prescription (image or PDF)</Label>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer overflow-hidden ${file ? 'border-secondary bg-secondary/5' : 'border-muted-foreground/20 hover:border-primary hover:bg-primary/5'}`}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    
                    {preview ? (
                      <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        {file?.type.startsWith('image/') ? (
                          <div className="relative h-48 w-48 mx-auto rounded-xl shadow-lg border bg-white overflow-hidden">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-48 w-48 mx-auto bg-muted rounded-xl flex flex-col items-center justify-center gap-2">
                            <FileText className="h-16 w-16 text-primary/40" />
                            <span className="text-xs font-bold text-muted-foreground">PDF Document</span>
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <p className="font-bold text-sm text-primary">{file?.name}</p>
                          <p className="text-xs text-muted-foreground">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          type="button" 
                          onClick={handleRemoveFile}
                          className="h-9 px-4"
                        >
                          <X className="h-4 w-4 mr-1.5" /> Remove & Change
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="p-4 bg-muted rounded-full">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-primary">Capture or select file</p>
                          <p className="text-xs">Supports Camera, Gallery, and PDF (Max 5MB)</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <span className="text-[10px] bg-accent px-2 py-1 rounded-full font-bold uppercase tracking-tight">JPG</span>
                          <span className="text-[10px] bg-accent px-2 py-1 rounded-full font-bold uppercase tracking-tight">PNG</span>
                          <span className="text-[10px] bg-accent px-2 py-1 rounded-full font-bold uppercase tracking-tight">PDF</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> Additional Instructions (Optional)
                  </Label>
                  <Input 
                    id="notes" 
                    placeholder="e.g. Please bring small currency change..." 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="h-12"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Sending your order...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button 
                  className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20" 
                  disabled={isUploading || !file}
                >
                  {isUploading ? (
                    <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Finalizing...</>
                  ) : (
                    <>Place Prescription Order <ArrowRight className="ml-2 h-6 w-6" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2 text-primary">
              <FileText className="h-6 w-6" />
              Upload Guidelines
            </h3>
            <div className="space-y-6">
              {[
                { title: "Camera & Gallery", desc: "You can take a photo directly or select one from your gallery.", icon: Camera },
                { title: "Clear Visibility", desc: "Ensure the patient's name, doctor's sign, and date are readable.", icon: Sparkles },
                { title: "Secure & Encrypted", desc: "Your medical data is stored securely and never shared.", icon: ShieldCheck },
                { title: "Format Support", desc: "We accept JPG, PNG images and PDF documents.", icon: FileText }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-accent rounded-xl flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
              <p className="text-xs text-secondary font-medium leading-relaxed italic">
                * Our pharmacists will call you to confirm the items and prices before dispatching the order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
