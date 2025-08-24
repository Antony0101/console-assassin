// console-patch.js
import util from "util";
process.send?.({ type: "hello", msg: "Patch is loaded!" });

["log", "error", "warn", "info", "debug"].forEach((level) => {
  const original = console[level];
  console[level] = (...args) => {
    process.send?.({
      type: "console",
      level,
      args: args.map((a) => util.inspect(a, { depth: 3 })),
    });
    original.apply(console, args);
  };
});
