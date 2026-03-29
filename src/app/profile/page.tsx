'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from './actions';
import { User, Mail, Phone, MapPin, Loader2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    async function loadSessionAndProfile() {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      const userEmail = session.user.email || '';
      setEmail(userEmail);
      
      try {
        // Fetch existing profile if any
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .single();
          
        if (profile) {
          setName(profile.name || '');
          setMobileNo(profile.mobile_no || '');
          setAddress(profile.address || '');
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadSessionAndProfile();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.append('email', email); // ensure email is submitted
    
    const result = await saveProfile(formData);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      toast({ title: 'Success', description: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    
    setLoading(false);
  }
  
  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex justify-between items-center text-center relative">
          <div className="flex-1 text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              User Profile
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your personal details and contact information.
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout} className="absolute right-0 top-6" title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-white py-10 px-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {message && (
              <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email Address
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  readOnly
                  disabled
                  value={email}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-500 bg-gray-50 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Email is linked to your account directly.</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Full Name
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-colors duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile_no" className="block text-sm font-medium leading-6 text-gray-900">
                Mobile Number
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="tel"
                  name="mobile_no"
                  id="mobile_no"
                  required
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-colors duration-200"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                Full Address
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute top-3 left-0 flex items-start pl-3">
                  <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-colors duration-200"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-black px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
