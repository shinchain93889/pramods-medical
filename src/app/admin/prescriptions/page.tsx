
"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, MessageSquare, Phone, MapPin, User, Calendar } from 'lucide-react';
import Image from 'next/image';

interface PrescriptionOrder {
  id: string;
  name: string;
  phone: string;
  address: string;
  extra_notes: string;
  prescription_url: string;
  is_processed: boolean;
  created_at: string;
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPrescriptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('prescriptions')
      .update({ is_processed: !currentStatus })
      .eq('id', id);

    if (!error) {
      setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, is_processed: !currentStatus } : p));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Prescription Orders</h1>
          <p className="text-muted-foreground mt-1">Review and manage patient prescription uploads.</p>
        </div>
        <Button onClick={fetchPrescriptions} variant="outline" size="sm">Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.length === 0 ? (
          <Card className="p-20 text-center border-dashed">
            <p className="text-muted-foreground">No prescription orders found.</p>
          </Card>
        ) : (
          prescriptions.map((order) => (
            <Card key={order.id} className={`overflow-hidden border-l-4 ${order.is_processed ? 'border-l-green-500' : 'border-l-amber-500'}`}>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-3 relative h-64 md:h-full bg-muted min-h-[200px]">
                    <Image 
                      src={order.prescription_url} 
                      alt="Prescription" 
                      fill 
                      className="object-contain p-2"
                    />
                    <div className="absolute top-2 right-2">
                       <a href={order.prescription_url} target="_blank" rel="noreferrer">
                         <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                           <ExternalLink className="h-4 w-4" />
                         </Button>
                       </a>
                    </div>
                  </div>
                  <div className="md:col-span-9 p-6 space-y-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" /> {order.name}
                          </h3>
                          <Badge variant={order.is_processed ? "secondary" : "default"} className={order.is_processed ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                            {order.is_processed ? "Processed" : "Pending Review"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Received on {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant={order.is_processed ? "outline" : "default"}
                        onClick={() => toggleStatus(order.id, order.is_processed)}
                      >
                        {order.is_processed ? "Mark as Pending" : "Mark as Processed"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Contact Number
                          </span>
                          <p className="font-medium text-sm">{order.phone}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Delivery Address
                          </span>
                          <p className="font-medium text-sm leading-relaxed">{order.address}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Additional Notes
                          </span>
                          <p className="text-sm italic text-muted-foreground bg-accent/30 p-3 rounded-lg border border-border/40">
                             {order.extra_notes || "No extra instructions provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
