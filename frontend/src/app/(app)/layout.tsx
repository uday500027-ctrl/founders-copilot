import { AppHeader } from "@/components/AppHeader";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-graphite text-bone">
      <AppHeader />
      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
        {children}
      </main>
    </div>
  );
}
