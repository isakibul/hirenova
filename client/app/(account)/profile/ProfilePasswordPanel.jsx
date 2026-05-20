import FieldError from "@components/forms/FieldError";
import PasswordField from "@components/forms/PasswordField";
import Icon from "@components/Icon";
import LoadingCircle from "@components/LoadingCircle";

export default function ProfilePasswordPanel({
    isSavingPassword,
    onPasswordChange,
    onPasswordSubmit,
    onPasswordTouched,
    passwordForm,
    visiblePasswordErrors,
}) {
    return (<aside className="site-border site-card self-start rounded-lg border lg:col-span-1 lg:sticky lg:top-24">
      <div className="border-b border-[var(--site-border)] px-4 py-3">
        <h2 className="font-semibold">Change Password</h2>
        <p className="site-muted mt-1 text-xs">
          Use your current password before setting a new one.
        </p>
      </div>

      <form onSubmit={onPasswordSubmit} noValidate className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium">Current Password</span>
          <PasswordField value={passwordForm.currentPassword} onChange={(event) => onPasswordChange("currentPassword", event.target.value)} onBlur={() => onPasswordTouched("currentPassword")} aria-invalid={Boolean(visiblePasswordErrors.currentPassword)} aria-describedby={visiblePasswordErrors.currentPassword ? "profile-current-password-error" : undefined} containerClassName="mt-1" className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" autoComplete="current-password" required/>
          <FieldError id="profile-current-password-error" message={visiblePasswordErrors.currentPassword}/>
        </label>

        <label className="block">
          <span className="text-sm font-medium">New Password</span>
          <PasswordField value={passwordForm.newPassword} onChange={(event) => onPasswordChange("newPassword", event.target.value)} onBlur={() => onPasswordTouched("newPassword")} aria-invalid={Boolean(visiblePasswordErrors.newPassword)} aria-describedby={visiblePasswordErrors.newPassword ? "profile-new-password-error" : undefined} containerClassName="mt-1" className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={8} maxLength={50} autoComplete="new-password" required/>
          <FieldError id="profile-new-password-error" message={visiblePasswordErrors.newPassword}/>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Confirm Password</span>
          <PasswordField value={passwordForm.confirmPassword} onChange={(event) => onPasswordChange("confirmPassword", event.target.value)} onBlur={() => onPasswordTouched("confirmPassword")} aria-invalid={Boolean(visiblePasswordErrors.confirmPassword)} aria-describedby={visiblePasswordErrors.confirmPassword ? "profile-confirm-password-error" : undefined} containerClassName="mt-1" className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={8} maxLength={50} autoComplete="new-password" required/>
          <FieldError id="profile-confirm-password-error" message={visiblePasswordErrors.confirmPassword}/>
        </label>

        <button type="submit" disabled={isSavingPassword} className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
          {isSavingPassword ? (<LoadingCircle className="h-3.5 w-3.5" label="Updating password" />) : (<Icon name="check"/>)}
          {isSavingPassword ? "Updating" : "Update Password"}
        </button>
      </form>
    </aside>);
}
