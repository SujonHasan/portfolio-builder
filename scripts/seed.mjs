const seedUrl = process.env.SEED_URL || "http://localhost:3000/api/seed";

async function runSeed() {
  let response;

  try {
    response = await fetch(seedUrl, { method: "POST" });
  } catch (error) {
    console.error(`Could not reach ${seedUrl}.`);
    console.error("Start the dev server first with `pnpm dev` or `npm run dev`.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    payload = { success: false, error: text || "Seed route returned an empty response." };
  }

  if (!response.ok || !payload.success) {
    console.error(payload.error || "Seed failed.");
    if (payload.details) {
      console.error(payload.details);
      if (payload.details.includes("siteId_1_slug_1") && payload.details.includes("slug: null")) {
        console.error(
          "This usually means the dev server is still running old seed code. Stop it with Ctrl+C, restart `pnpm dev`, then run `pnpm run seed` again."
        );
      }
    }
    if (response.status === 403) {
      console.error("Make sure `.env.local` has `ENABLE_SEED_ROUTE=true` and restart the dev server.");
    }
    process.exit(1);
  }

  console.log(payload.message || "Database seeded successfully.");
}

runSeed();
