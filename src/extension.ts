// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { resolve } from 'path';

import { ESQuery } from './ESQuery';
import { ESQueriesTreeDataProvider, ESQueryTreeItem } from './EsQueriesTree';

// Set up some state vars that will be used when the extension is activated.
let logs:ESQuery[]=[];
let treeView:vscode.TreeView<ESQueryTreeItem>;
let treeViewDataProvider:ESQueriesTreeDataProvider;
let logTrackerDisposable:vscode.Disposable;
vscode.commands.executeCommand('setContext', 'esLogExtensionActivated', false); 	

export function activate(context: vscode.ExtensionContext) {
	// Indicate that the extension is activated, so that the view shows up in the panel.
	vscode.commands.executeCommand('setContext', 'esLogExtensionActivated', true); 	

	let { breakpointLocation, logMessageCode} = vscode.workspace.getConfiguration('codeapalooza');
	breakpointLocation = breakpointLocation.split(':');
	// Get the root workspace path, and return if there isn't one.
	const rootPath =
	vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
	  ? vscode.workspace.workspaceFolders[0].uri.fsPath
	  : undefined;
	if (!rootPath) {
		return;
	}

	// Create the tree view.
	treeViewDataProvider = new ESQueriesTreeDataProvider(rootPath, logs); 
	treeView = vscode.window.createTreeView('logEsQueries-queries', {
		treeDataProvider: treeViewDataProvider
	});	

	// Get the path to the breakpoint we want to set.
	const targetPath:string = resolve(rootPath, breakpointLocation[0]);		
	const uri = vscode.Uri.file(targetPath);
	const position = new vscode.Position(parseInt(breakpointLocation[1]), parseInt(breakpointLocation[2])); // Set your line and column number
	const location = new vscode.Location(uri, position);
	const breakpoint = new vscode.SourceBreakpoint(location, true, undefined, undefined, `ES: {${logMessageCode}}`);

	// Implement the command to start logging.
	const esLogQueriesCommandDisposable = vscode.commands.registerCommand('codeapalooza.logEsQueries', () => {
		// Add the breakpoint.
		vscode.debug.addBreakpoints([breakpoint]);		
		// Indicate that the breakpoint is set.
		vscode.commands.executeCommand('setContext', 'esLogBreakpointExists', true); 	

		// Create the log tracker.
		logTrackerDisposable = vscode.debug.registerDebugAdapterTrackerFactory('*', {
			createDebugAdapterTracker(session: vscode.DebugSession) {
			return {
				// When the debugger sends a message matching our specifications, create an ESQuery instance from it
				// and push it onto our array, then refresh the tree.
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

	// Implement the command to stop logging.
	const noEsLogQueriesCommandDisposable = vscode.commands.registerCommand('codeapalooza.noLogEsQueries', () => {
		// Remove the breakpoint.
		vscode.debug.removeBreakpoints([breakpoint]);		
		// Indicate thtat breakpoint is no longer there.
		vscode.commands.executeCommand('setContext', 'esLogBreakpointExists', false); 	
		// Dispose of the tracker if it's been set.
		if (logTrackerDisposable) {
			logTrackerDisposable.dispose();
		}
	});

	// Implement the command to copy a logged query as cURL.
	const copyCurlCommandDisposable = vscode.commands.registerCommand('codeapalooza.copyCurl', (item: ESQueryTreeItem) => {
		vscode.env.clipboard.writeText(item.getCurl());
	});
	const copyCurlPrettyCommandDisposable = vscode.commands.registerCommand('codeapalooza.copyCurlPretty', (item: ESQueryTreeItem) => {
		vscode.env.clipboard.writeText(item.getCurl(true));
	});
	const copyJsonCommandDisposable = vscode.commands.registerCommand('codeapalooza.copyJson', (item: ESQueryTreeItem) => {
		vscode.env.clipboard.writeText(item.getJson());
	});
	const copyJsonPrettyCommandDisposable = vscode.commands.registerCommand('codeapalooza.copyJsonPretty', (item: ESQueryTreeItem) => {
		vscode.env.clipboard.writeText(item.getJson(true));
	});

	// Add our disposables so that they're disposed of when the extension deactivates.
	context.subscriptions.push(
		esLogQueriesCommandDisposable, 
		noEsLogQueriesCommandDisposable, 
		copyCurlCommandDisposable, 
		copyCurlPrettyCommandDisposable,
		copyJsonCommandDisposable,
		copyJsonPrettyCommandDisposable		
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
