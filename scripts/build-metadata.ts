export function getGeneratedAt() {
  return process.env.GARCH_GENERATED_AT ?? new Date().toISOString();
}

export function getBuildEventId(generatedAt: string) {
  return `build.${generatedAt.replace(/[^0-9A-Za-z]/g, "")}`;
}

export function getGitMetadata() {
  return {
    commit_sha: process.env.GARCH_COMMIT_SHA ?? null,
    modified_files: (process.env.GARCH_MODIFIED_FILES ?? "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
  };
}
