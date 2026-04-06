import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/brand";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-muted-foreground">
          {APP_TAGLINE}
        </div>
        <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Build and publish your portfolio from one clean dashboard
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {APP_DESCRIPTION} Create a polished site, manage resume templates, customize themes,
          and publish to your own subdomain in minutes.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/admin/register">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/login">Sign In</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Public sites will be available at clean URLs like{" "}
          <span className="font-medium">yourapp.com/username</span> or subdomains like{" "}
          <span className="font-medium">username.yourapp.com</span>.
        </p>
      </section>
    </main>
  );
}
