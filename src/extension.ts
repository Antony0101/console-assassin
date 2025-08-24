import * as vscode from "vscode";
import { spawn } from "child_process";
import * as path from "path";
import fs from "fs/promises";

export function activate(context: vscode.ExtensionContext) {
  console.log("in activate");
  const outputChannel = vscode.window.createOutputChannel("Console Assassin");

  const disposable = vscode.commands.registerCommand(
    "consoleAssassin.run",
    async () => {
      // Example target app (change this to your entry file)

      const appPath = path.join(vscode.workspace.rootPath || "", "app.js");
      const patchPath = path.join(
        context.extensionPath,
        "src",
        "console-patch.js"
      );

      const child = spawn("node", ["--require", patchPath, appPath], {
        cwd: vscode.workspace.rootPath,
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      });

      child.stdout?.on("data", (data) => {
        // outputChannel.appendLine(`[LOG] ${data.toString()}`);
      });

      child.stderr?.on("data", (data) => {
        outputChannel.appendLine(`[ERROR] ${data.toString()}`);
        vscode.window.showErrorMessage(data.toString());
      });

      child.on("message", (msg: any) => {
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
          `\n--- Process exited with code ${code} ---\n`
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

export function deactivate() {}
