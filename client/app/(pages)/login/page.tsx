import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <section className="px-5 md:px-[10vw] py-12">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            Login
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Welcome back to HireNova
          </h1>
          <p className="site-muted mt-4 max-w-lg text-sm leading-6">
            Sign in to continue reviewing your matches, alerts, and career
            profile insights.
          </p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
