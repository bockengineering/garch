import { loadData } from "./data-loader";
import { validateData } from "./validation";

async function main() {
  const data = await loadData();
  const issues = validateData(data);

  if (issues.length > 0) {
    console.error("Data validation failed:");
    issues.forEach((issue) => {
      console.error(`- [${issue.code}] ${issue.message}`);
    });
    process.exit(1);
  }

  console.log("Data validation passed.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
