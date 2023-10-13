import * as vscode from 'vscode';

export class ESQueriesTreeDataProvider implements vscode.TreeDataProvider<ESQueryTreeItem> {
    constructor(private workspaceRoot: string, private logs: string[]) {}
  
    getTreeItem(element: ESQueryTreeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(element?: ESQueryTreeItem): Thenable<ESQueryTreeItem[]> {
        return Promise.resolve(
            this.logs.forEach(log => new ESQueryTreeItem(log));
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

  
  