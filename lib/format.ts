export function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not verified";
  }

  return value.slice(0, 10);
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function asSourceRefs(value: unknown): Array<{ source_id: string; page?: string | number; usage?: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is { source_id: string; page?: string | number; usage?: string } =>
      typeof item === "object" &&
      item !== null &&
      "source_id" in item &&
      typeof (item as { source_id: unknown }).source_id === "string"
  );
}
