import SignupForm from "./SignupForm";

type SignupPageProps = {
  searchParams: Promise<{ email?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { email } = await searchParams;
  const initialEmail = Array.isArray(email) ? email[0] : email;

  return (
    <section className="px-5 md:px-[10vw] py-12">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            Get Started
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Build your AI-powered career profile
          </h1>
          <p className="site-muted mt-4 max-w-lg text-sm leading-6">
            Sign up to receive smarter job matches, resume insights, and alerts
            when high-fit roles open.
          </p>
        </div>

        <SignupForm initialEmail={initialEmail} />
      </div>
    </section>
  );
}
