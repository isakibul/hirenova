"use client";

import { useState } from "react";
import {
  getVisibleErrors,
  hasValidationErrors,
  touchAll,
} from "@lib/formValidation";

export default function useValidatedForm(initialForm, validateForm) {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const validationErrors = validateForm(form);
  const visibleErrors = getVisibleErrors(
    validationErrors,
    touched,
    submitAttempted,
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function markTouched(field) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function prepareSubmit() {
    setSubmitAttempted(true);
    setTouched(touchAll(validationErrors));
    return !hasValidationErrors(validationErrors);
  }

  function resetForm(nextForm = initialForm) {
    setForm(nextForm);
    setTouched({});
    setSubmitAttempted(false);
  }

  return {
    form,
    markTouched,
    prepareSubmit,
    resetForm,
    setForm,
    setTouched,
    updateField,
    validationErrors,
    visibleErrors,
  };
}
