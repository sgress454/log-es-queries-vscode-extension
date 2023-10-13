import * as vscode from 'vscode';
import { ESQuery } from './ESQuery';
export class ESQueriesTreeDataProvider implements vscode.TreeDataProvider<ESQueryTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ESQueryTreeItem | undefined | null | void> = new vscode.EventEmitter<ESQueryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ESQueryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    constructor(private workspaceRoot: string, private logs: ESQuery[]) {}
  
    getTreeItem(element: ESQueryTreeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(element?: ESQueryTreeItem): Thenable<ESQueryTreeItem[]> {
        return Promise.resolve(
            this.logs.map(log => new ESQueryTreeItem(log))
        );
    }
}

export class ESQueryTreeItem extends vscode.TreeItem {
    constructor(
        private esQuery:ESQuery
    ) {
        const time = new Date(esQuery.time).toISOString();
        const termsCount = esQuery.log.match(/"term"|"terms"|"exists"|"range"|"match"/g)?.length || 0;
        super(`${time}: ${esQuery.index}/${esQuery.type} (~${termsCount} ${termsCount === 1 ? 'term' : 'terms'})`, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'esQuery';
    }

    getCurl(): string {
        return `curl http://localhost:9200/${this.esQuery.index}/${this.esQuery.type}/_search -d '${JSON.stringify(this.esQuery.body)}'`;
    }
}

  
  