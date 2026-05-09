import ResetPasswordForm from "./ResetPasswordForm";

function getToken(searchParams) {
    const token = searchParams?.token;

    if (Array.isArray(token)) {
        return token[0] ?? "";
    }

    return token ?? "";
}

export default async function ResetPasswordPage({ searchParams }) {
    const params = await searchParams;
    const token = getToken(params);

    return (<section className="px-5 py-12 md:px-[10vw]">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            Password Recovery
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Create a new password
          </h1>
          <p className="site-muted mt-4 max-w-lg text-sm leading-6">
            Choose a strong password to finish recovering your HireNova account.
          </p>
        </div>

        <ResetPasswordForm token={token}/>
      </div>
    </section>);
}
