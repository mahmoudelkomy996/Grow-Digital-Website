import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <main className="container-site section-y">
      <Logo className="h-10 text-teal-900" />
      <h1 className="mt-10 text-display">It&apos;s time to <em className="accent-word">grow</em>.</h1>
    </main>
  );
}
