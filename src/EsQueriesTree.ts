import * as vscode from 'vscode';

export class ESQueriesTreeDataProvider implements vscode.TreeDataProvider<ESQueryTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ESQueryTreeItem | undefined | null | void> = new vscode.EventEmitter<ESQueryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ESQueryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    constructor(private workspaceRoot: string, private logs: string[]) {}
  
    getTreeItem(element: ESQueryTreeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(element?: ESQueryTreeItem): Thenable<ESQueryTreeItem[]> {
        return Promise.resolve(
            this.logs.map(log => new ESQueryTreeItem(log.split('ES:')[1]))
        );
    }
}

export class ESQueryTreeItem extends vscode.TreeItem {
    private index:string;
    private type:string;
    private body:object;
    constructor(
        private log: string
    ) {
        const logObj = JSON.parse(log);
        super(`${logObj.index}/${logObj.type}`, vscode.TreeItemCollapsibleState.None);
        this.index = logObj.index;
        this.type = logObj.type;
        this.body = logObj.body;
        this.contextValue = 'esQuery';
    }

    getCurl(): string {
        return `curl http://localhost:9200/${this.index}/${this.type}/_search -d '${JSON.stringify(this.body)}'`;
    }
}

  
  