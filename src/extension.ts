// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { resolve } from 'path';

import { ESQuery } from './ESQuery';
import { ESQueriesTreeDataProvider, ESQueryTreeItem } from './EsQueriesTree';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let logs:ESQuery[]=[];
let treeView:vscode.TreeView<ESQueryTreeItem>;
let treeViewDataProvider:ESQueriesTreeDataProvider;
let logTrackerDisposable:vscode.Disposable;
const rootPath =
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
if (rootPath) {
	treeViewDataProvider = new ESQueriesTreeDataProvider(rootPath, logs); 
}

vscode.commands.executeCommand('setContext', 'esLogExtensionActivated', false); 	

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.executeCommand('setContext', 'esLogExtensionActivated', true); 	

	if (!treeView) {
		treeView = vscode.window.createTreeView('logEsQueries-queries', {
			treeDataProvider: treeViewDataProvider
		});	
	}

	let folder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
	let rootPath:string='';
	if (!folder) {
		vscode.window.showInformationMessage('Could not determine workspace folder.');
		return;
	}
	rootPath = folder.uri.fsPath;
	const targetPath:string = resolve(rootPath, 'node_modules/@elastic/elasticsearch/api/api/search.js');		
	const uri = vscode.Uri.file(targetPath);
	const position = new vscode.Position(142, 5); // Set your line and column number
	const location = new vscode.Location(uri, position);
	const breakpoint = new vscode.SourceBreakpoint(location, true, undefined, undefined, 'ES: {JSON.stringify(params)}');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	vscode.commands.executeCommand('setContext', 'esLogBreakpointExists', false); 	
	
	const esLogQueriesCommandDisposable = vscode.commands.registerCommand('codeapalooza.logEsQueries', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
        vscode.debug.addBreakpoints([breakpoint]);		
		vscode.commands.executeCommand('setContext', 'esLogBreakpointExists', true); 	

		// Create the log tracker.
		logTrackerDisposable = vscode.debug.registerDebugAdapterTrackerFactory('*', {
			createDebugAdapterTracker(session: vscode.DebugSession) {
			return {
				// onWillReceiveMessage: m => console.log(`> ${JSON.stringify(m, undefined, 2)}`),
				onDidSendMessage: m => {
					if (m.type === 'event' && m.event === 'output' && m.body.category === 'stdout' && m.body.output.indexOf('ES:') === 0) {
						logs.push(new ESQuery(Date.now(), m.body.output));
						treeViewDataProvider.refresh();					
					}
				}
			};
			}
		});
	});

	const noEsLogQueriesCommandDisposable = vscode.commands.registerCommand('codeapalooza.noLogEsQueries', () => {
		vscode.window.showInformationMessage(`Number of logs: ${logs.length}`);
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
        vscode.debug.removeBreakpoints([breakpoint]);		
		vscode.commands.executeCommand('setContext', 'esLogBreakpointExists', false); 	
		if (logTrackerDisposable) {
			logTrackerDisposable.dispose();
		}
	});

	const copyCurlCommandDisposable = vscode.commands.registerCommand('codeapalooza.copyCurl', (item: ESQueryTreeItem) => {
		vscode.env.clipboard.writeText(item.getCurl());
	});


	context.subscriptions.push(esLogQueriesCommandDisposable, noEsLogQueriesCommandDisposable, copyCurlCommandDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
