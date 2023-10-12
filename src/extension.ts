// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { resolve } from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codeapalooza.logEsQueries', () => {
		let folder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
		let rootPath:string='';
		if (!folder) {
			vscode.window.showInformationMessage('Could not determine workspace folder.');
			return;
		}
		rootPath = folder.uri.fsPath;
		const targetPath:string = resolve(rootPath, 'node_modules/@elastic/elasticsearch/api/api/search.js')		
		vscode.window.showInformationMessage(rootPath);
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const uri = vscode.Uri.file(targetPath);
        const position = new vscode.Position(142, 5); // Set your line and column number
        const location = new vscode.Location(uri, position);
        vscode.debug.addBreakpoints([new vscode.SourceBreakpoint(location, true, undefined, undefined, 'ES: {JSON.stringify(params.body)}')]);		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
