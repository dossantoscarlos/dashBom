export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateRequired(
  value: string,
  fieldLabel: string,
): ValidationResult {
  if (!value.trim()) {
    return { ok: false, message: `${fieldLabel} é obrigatório.` };
  }
  return { ok: true };
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { ok: false, message: "E-mail é obrigatório." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Informe um e-mail válido." };
  }
  return { ok: true };
}

export function validateDateRange(
  start: string,
  end: string,
): ValidationResult {
  if (!start || !end) return { ok: true };
  if (new Date(start) > new Date(end)) {
    return {
      ok: false,
      message: "A data de início deve ser anterior à data de fim.",
    };
  }
  return { ok: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) return { ok: true };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) {
    return { ok: false, message: "Telefone deve ter 10 ou 11 dígitos." };
  }
  return { ok: true };
}

export function combineValidations(
  ...results: ValidationResult[]
): ValidationResult {
  const failed = results.find((r) => !r.ok);
  return failed ?? { ok: true };
}
