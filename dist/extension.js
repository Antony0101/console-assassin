"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var import_child_process = require("child_process");
var path = __toESM(require("path"));
function activate(context) {
  console.log("in activate");
  const outputChannel = vscode.window.createOutputChannel("Console Assassin");
  const disposable = vscode.commands.registerCommand(
    "consoleAssassin.run",
    async () => {
      const appPath = path.join(vscode.workspace.rootPath || "", "app.js");
      const patchPath = path.join(
        context.extensionPath,
        "src",
        "console-patch.js"
      );
      const child = (0, import_child_process.spawn)("node", ["--require", patchPath, appPath], {
        cwd: vscode.workspace.rootPath,
        stdio: ["pipe", "pipe", "pipe", "ipc"]
      });
      child.stdout?.on("data", (data) => {
      });
      child.stderr?.on("data", (data) => {
        outputChannel.appendLine(`[ERROR] ${data.toString()}`);
        vscode.window.showErrorMessage(data.toString());
      });
      child.on("message", (msg) => {
        console.log("in message", msg);
        if (msg.type === "console") {
          outputChannel.appendLine(
            `[${msg.level.toUpperCase()}] ${msg.args.join(" ")}`
          );
        }
      });
      child.on("exit", (code) => {
        console.log("in exit");
        outputChannel.appendLine(
          `
--- Process exited with code ${code} ---
`
        );
      });
      vscode.window.showInformationMessage(
        "App started with Console Assassin!"
      );
      outputChannel.show(true);
    }
  );
  context.subscriptions.push(disposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
