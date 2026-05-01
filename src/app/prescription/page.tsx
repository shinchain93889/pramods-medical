"use client"

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.type === 'application/pdf') {
      setPreview('pdf'); // Set a special string for PDF
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Upload Required", description: "Please upload your prescription.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('prescription', file);

      setUploadProgress(40);

      const result = await savePrescriptionOrder(data);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setUploadProgress(100);
      setIsSuccess(true);
      toast({ title: "Success!", description: "Prescription uploaded successfully." });
      setIsUploading(false);

    } catch (error: any) {
      console.error(error);
      setIsUploading(false);
      toast({ title: "Upload Failed", description: error.message || "Failed to upload prescription.", variant: "destructive" });
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-primary/5 flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold font-headline text-slate-900">Upload Successful!</h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto">
              Thank you, <span className="font-bold text-primary">{formData.name}</span>. Your prescription has been securely stored and our team will review it shortly.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
            <Button 
              className="flex-1 h-14 text-lg font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all border-none" 
              onClick={() => {
                setIsSuccess(false);
                setFile(null);
                setPreview(null);
                setFormData({ name: '', phone: '' });
              }}
            >
              Upload Another
            </Button>
            <Button 
              className="flex-1 h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all" 
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-sm uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" /> Secure Medical Upload
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 font-headline tracking-tight leading-tight">
          Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Prescription</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium">
          Simply upload your prescription and our certified pharmacists will take care of the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-sm">
            <CardContent className="p-10 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. John Doe" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-lg font-medium px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required 
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-lg font-medium px-6"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Prescription File</Label>
                  <div 
                    className={`relative group border-3 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer overflow-hidden ${file ? 'border-secondary bg-secondary/[0.02]' : 'border-slate-200 hover:border-primary hover:bg-primary/[0.02]'}`}
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
                      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        {file?.type.startsWith('image/') ? (
                          <div className="relative h-64 w-64 mx-auto rounded-3xl shadow-2xl border-4 border-white overflow-hidden ring-1 ring-slate-100">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-64 w-64 mx-auto bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-4 border border-slate-100 shadow-inner">
                            <FileText className="h-20 w-20 text-primary/40" />
                            <span className="text-sm font-bold text-slate-400">PDF DOCUMENT</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-bold text-xl text-slate-900">{file?.name}</p>
                          <p className="text-sm font-medium text-slate-400 uppercase">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          type="button" 
                          onClick={handleRemoveFile}
                          className="rounded-xl border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all font-bold px-8"
                        >
                          <X className="h-5 w-5 mr-2" /> Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 py-4">
                        <div className="p-6 bg-slate-50 rounded-[2rem] text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                          <Upload className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-slate-900">Click to upload or drag & drop</p>
                          <p className="text-slate-400 font-medium">Capture from camera or select JPG, PNG, PDF (Max 5MB)</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          {['JPG', 'PNG', 'PDF'].map(ext => (
                            <span key={ext} className="text-xs font-black bg-slate-100 px-4 py-2 rounded-xl text-slate-500 tracking-tighter">{ext}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-black text-primary uppercase tracking-widest">Uploading Prescription...</span>
                      <span className="text-2xl font-black text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-3 rounded-full bg-slate-100" />
                  </div>
                )}

                <Button 
                  className="w-full h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] shadow-xl shadow-primary/20 group overflow-hidden relative" 
                  disabled={isUploading || !file}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isUploading ? (
                      <><Loader2 className="h-6 w-6 animate-spin" /> SECURING FILE...</>
                    ) : (
                      <>UPLOAD PRESCRIPTION <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="h-48 w-48" />
            </div>
            <h3 className="font-black text-3xl font-headline relative z-10">
              Why Upload Online?
            </h3>
            <div className="space-y-8 relative z-10">
              {[
                { title: "Privacy First", desc: "Your medical documents are encrypted and stored in secure HIPAA-compliant storage.", icon: ShieldCheck },
                { title: "Real-time Processing", desc: "Our pharmacists are notified instantly the moment you upload your file.", icon: Sparkles },
                { title: "Clear Guidelines", desc: "Ensure your prescription shows patient name, date, and doctor's signature.", icon: FileText }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="h-14 w-14 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <item.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xl">{item.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm relative z-10">
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                "Our mission is to provide the fastest medical service while maintaining the highest security standards for your health data."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

