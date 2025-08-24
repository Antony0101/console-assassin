import * as vscode from "vscode";
import { spawn } from "child_process";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("in activate");
  const outputChannel = vscode.window.createOutputChannel("Console Assassin");

  const disposable = vscode.commands.registerCommand(
    "consoleAssassin.run",
    () => {
      // Example target app (change this to your entry file)

      const appPath = path.join(vscode.workspace.rootPath || "", "app.js");
      const patchPath = path.join(
        context.extensionPath,
        "src",
        "console-patch.js"
      );

      const child = spawn("node", ["--require", patchPath, appPath], {
        cwd: vscode.workspace.rootPath,
        stdio: ["inherit", "inherit", "inherit", "ipc"],
      });

      child.on("message", (msg: any) => {
        if (msg.type === "console") {
          outputChannel.appendLine(
            `[${msg.level.toUpperCase()}] ${msg.args.join(" ")}`
          );
        }
      });

      child.on("exit", (code) => {
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
