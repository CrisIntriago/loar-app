import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import CloseButton from "@/components/CloseButton";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ executionId?: string | string[] }> }) {
  const { executionId: rawExecutionId } = await searchParams;
  const executionId = Array.isArray(rawExecutionId)
    ? rawExecutionId.find(v => v !== '') || undefined
    : rawExecutionId || undefined;

  // Fetch active products server-side for initial grid
  const { data: products } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4">
        <CloseButton executionId={executionId} />
      </div>
      <OnboardingFlow initialProducts={products || []} executionId={executionId} />
    </main>
  );
}
