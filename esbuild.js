const esbuild = require("esbuild");
const isWSL = require("is-wsl");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`
        );
      });
      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode"],
    logLevel: "silent",
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });
  //   default config
  //   if (watch) {
  //     await ctx.watch();
  //   } else {
  //     await ctx.rebuild();
  //     await ctx.dispose();
  //   }

  //   for wsl support
  if (watch) {
    if (isWSL) {
      console.log("⚠️  Running in WSL → using rebuild/dispose fallback");
      await ctx.rebuild();
      await ctx.dispose();
    } else {
      console.log("👀 Running in normal mode → enabling watch");
      await ctx.watch();
    }
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
