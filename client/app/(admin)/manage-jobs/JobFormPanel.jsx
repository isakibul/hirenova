import FieldError from "@components/forms/FieldError";
import RichTextField from "@components/forms/RichTextField";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";

import { jobTypeOptions } from "./jobUtils";

export default function JobFormPanel({
  editingJobId,
  form,
  isAdmin,
  isFormOpen,
  isSubmitting,
  onCancel,
  onSubmit,
  onToggleOpen,
  onTouchField,
  onUpdateField,
  selectedJob,
  visibleErrors,
}) {
  return (
    <aside className="site-border site-card self-start rounded-lg border 2xl:sticky 2xl:top-24">
      <div className="flex items-center justify-between border-b border-[var(--site-border)] px-4 py-3">
        <div>
          <h2 className="font-semibold">
            {editingJobId ? "Edit Job" : "Create Job"}
          </h2>
          <p className="site-muted mt-1 text-xs">
            {editingJobId
              ? (selectedJob?.title ?? "Update selected listing")
              : isAdmin
                ? "Publish a new listing"
                : "Submit a new listing for admin approval"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="site-border site-field rounded-md border p-2"
          aria-label={isFormOpen ? "Collapse form" : "Expand form"}
        >
          <Icon name={isFormOpen ? "x" : "plus"} />
        </button>
      </div>

      {isFormOpen ? (
        <form onSubmit={onSubmit} noValidate className="space-y-4 p-4">
          {!isAdmin ? (
            <div className="site-border site-panel rounded-lg border p-3 text-xs leading-5">
              New and edited jobs enter admin review before appearing in public
              job search.
            </div>
          ) : null}
          {selectedJob?.approvalStatus === "declined" &&
          selectedJob.rejectionNote ? (
            <div className="site-danger rounded-lg border p-3 text-xs leading-5">
              <span className="font-semibold">Admin note: </span>
              {selectedJob.rejectionNote}
              {!isAdmin ? (
                <p className="mt-2 font-semibold">
                  Update the job details and resubmit it for admin review.
                </p>
              ) : null}
            </div>
          ) : null}
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              value={form.title}
              onChange={(event) => onUpdateField("title", event.target.value)}
              onBlur={() => onTouchField("title")}
              aria-invalid={Boolean(visibleErrors.title)}
              aria-describedby={
                visibleErrors.title ? "job-title-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              minLength={10}
              maxLength={150}
              required
              placeholder="Senior Product Designer"
            />
            <FieldError id="job-title-error" message={visibleErrors.title} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="text-sm font-medium">Location</span>
              <input
                value={form.location}
                onChange={(event) =>
                  onUpdateField("location", event.target.value)
                }
                onBlur={() => onTouchField("location")}
                aria-invalid={Boolean(visibleErrors.location)}
                aria-describedby={
                  visibleErrors.location ? "job-location-error" : undefined
                }
                className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                maxLength={100}
                placeholder="Dhaka or Remote"
              />
              <FieldError
                id="job-location-error"
                message={visibleErrors.location}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Job Type</span>
              <SelectField
                value={form.jobType}
                onChange={(nextValue) => onUpdateField("jobType", nextValue)}
                onBlur={() => onTouchField("jobType")}
                options={jobTypeOptions}
                className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                ariaInvalid={Boolean(visibleErrors.jobType)}
                ariaDescribedBy={
                  visibleErrors.jobType ? "job-type-error" : undefined
                }
              />
              <FieldError id="job-type-error" message={visibleErrors.jobType} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <span className="text-sm font-medium">Experience Range</span>
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <input
                  value={form.experienceMin}
                  onChange={(event) =>
                    onUpdateField("experienceMin", event.target.value)
                  }
                  onBlur={() => onTouchField("experienceMin")}
                  aria-invalid={Boolean(visibleErrors.experienceMin)}
                  aria-describedby={
                    visibleErrors.experienceMin
                      ? "job-experience-min-error"
                      : undefined
                  }
                  className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  min={0}
                  type="number"
                  placeholder="Min"
                />
                <input
                  value={form.experienceMax}
                  onChange={(event) =>
                    onUpdateField("experienceMax", event.target.value)
                  }
                  onBlur={() => onTouchField("experienceMax")}
                  aria-invalid={Boolean(visibleErrors.experienceMax)}
                  aria-describedby={
                    visibleErrors.experienceMax
                      ? "job-experience-max-error"
                      : undefined
                  }
                  className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  min={0}
                  type="number"
                  placeholder="Max"
                />
              </div>
              <FieldError
                id="job-experience-min-error"
                message={visibleErrors.experienceMin}
              />
              <FieldError
                id="job-experience-max-error"
                message={visibleErrors.experienceMax}
              />
            </div>

            <label className="block">
              <span className="text-sm font-medium">Salary</span>
              <input
                value={form.salary}
                onChange={(event) => onUpdateField("salary", event.target.value)}
                onBlur={() => onTouchField("salary")}
                aria-invalid={Boolean(visibleErrors.salary)}
                aria-describedby={
                  visibleErrors.salary ? "job-salary-error" : undefined
                }
                className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                min={0}
                type="number"
                placeholder="90000"
              />
              <FieldError id="job-salary-error" message={visibleErrors.salary} />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Expiry Date</span>
            <input
              value={form.expiresAt}
              onChange={(event) => onUpdateField("expiresAt", event.target.value)}
              onBlur={() => onTouchField("expiresAt")}
              aria-invalid={Boolean(visibleErrors.expiresAt)}
              aria-describedby={
                visibleErrors.expiresAt ? "job-expires-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              type="date"
            />
            <FieldError id="job-expires-error" message={visibleErrors.expiresAt} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Skills Required</span>
            <input
              value={form.skillsRequired}
              onChange={(event) =>
                onUpdateField("skillsRequired", event.target.value)
              }
              onBlur={() => onTouchField("skillsRequired")}
              aria-invalid={Boolean(visibleErrors.skillsRequired)}
              aria-describedby={
                visibleErrors.skillsRequired ? "job-skills-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              placeholder="React, Node.js, Product Design"
            />
            <FieldError
              id="job-skills-error"
              message={visibleErrors.skillsRequired}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <RichTextField
              value={form.description}
              onChange={(nextValue) => onUpdateField("description", nextValue)}
              onBlur={() => onTouchField("description")}
              invalid={Boolean(visibleErrors.description)}
              describedBy={
                visibleErrors.description ? "job-description-error" : undefined
              }
              maxLength={5000}
              placeholder={
                "Describe the role. Example:\n## Responsibilities\n- Build product features\n- Collaborate with design and backend\n\n## Requirements\n- 3+ years of React experience"
              }
            />
            <FieldError
              id="job-description-error"
              message={visibleErrors.description}
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="site-button inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
            >
              <Icon name="check" />
              {isSubmitting
                ? "Saving..."
                : editingJobId
                  ? !isAdmin && selectedJob?.approvalStatus === "declined"
                    ? "Resubmit for Review"
                    : "Save Changes"
                  : "Create Job"}
            </button>
            {editingJobId ? (
              <button
                type="button"
                onClick={onCancel}
                className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="site-muted p-4 text-sm leading-6">
          Open this panel only when you need to create or edit a listing. The
          jobs table stays easier to scan while the form is collapsed.
        </div>
      )}
    </aside>
  );
}
