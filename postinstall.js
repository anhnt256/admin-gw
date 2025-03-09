const { execSync } = require("child_process");

try {
  // Force Prisma CLI to use the correct OpenSSL version
  process.env.PRISMA_CLI_BINARY_TARGETS = "rhel-openssl-1.0.x";
  execSync("prisma generate", { stdio: "inherit" });
} catch (error) {
  console.error("Error during Prisma Client generation:", error);
  process.exit(1);
}
