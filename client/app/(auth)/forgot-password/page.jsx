import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            Password Recovery
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Reset your HireNova password
          </h1>
          <p className="site-muted mt-4 max-w-lg text-sm leading-6">
            Enter the email connected to your account and we&apos;ll send you a
            secure reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </section>);
}
