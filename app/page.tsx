import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch active products server-side for initial grid
  const { data: products } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  return (
    <main className="min-h-screen bg-gray-50">
      <OnboardingFlow initialProducts={products || []} />
    </main>
  );
}
