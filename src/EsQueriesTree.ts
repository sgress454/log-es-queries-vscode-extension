import * as vscode from 'vscode';
import { ESQuery } from './ESQuery';
export class ESQueriesTreeDataProvider implements vscode.TreeDataProvider<ESQueryTreeItem> {
    // Implement the "onDidChangeTreeData" event.
    // Internally VSCode will handle this event by calling `getChildren()` and re-rendering the tree.
    private _onDidChangeTreeData: vscode.EventEmitter<ESQueryTreeItem | undefined | null | void> = new vscode.EventEmitter<ESQueryTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ESQueryTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    // Shorthand constructor to add a couple of instance vars.
    constructor(private workspaceRoot: string, private logs: ESQuery[]) {}

    // We'll call this when we get new logs, to re-render the tree.
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get the children of the provided element, or the root items of element is not provided.
     * In our case we return ESQueryTreeItems but we could return any type as a tree item,
     * we'd just need to implement `getTreeItem` in such a way as to translate our item into a TreeItem.
     * @param {ESQueryTreeItem} [element] - the element to get children of
     * @returns {Thenable<ESQueryTreeItem[]>} - a promise resolving to an array of ESQueryTreeItems
     */
    getChildren(element?: ESQueryTreeItem): Thenable<ESQueryTreeItem[]> {
        if (!element) {
            return Promise.resolve(
                this.logs.map(log => new ESQueryTreeItem(log))
            );
        } else {
            return Promise.resolve([new ESQueryTreeItem(element.esQuery, true)])
        }
    }

    /**
     * Return tree items as-is when requested.  Our `getChildren()` method returns ESQueryTreeItem instances
     * which are a child class of TreeItem, so we can just return them and VSCode will know how to render them.
     * If we had `getChildren()` return objects of a different type (like ESQuery objects) we'd need to create
     * new instances of TreeItem (or some subclass thereof) to return from getTreeItem().
     * @param {ESQueryTreeItem} element - the item to render a representation of
     * @returns {TreeItem} - a TreeItem to render
     */
    getTreeItem(element: ESQueryTreeItem): vscode.TreeItem {
        return element;
    }  
}

export class ESQueryTreeItem extends vscode.TreeItem {
    constructor(
        // The ESQuery object containing the data for this item.
        readonly esQuery:ESQuery,
        // Whether or not this item represents a "detail" view, i.e. an expanded view of a query log.
        detailView?:boolean,
    ) {
        let label:string;
        let collapsibleState:vscode.TreeItemCollapsibleState;
        // For non-detail (collapsed) view, show the time and a summary of the query.
        if (!detailView) {
            const time = new Date(esQuery.time).toISOString();
            const termsCount = esQuery.log.match(/"term"|"terms"|"exists"|"range"|"match"/g)?.length || 0;
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            label = `${time}: ${esQuery.index}/${esQuery.type} (~${termsCount} ${termsCount === 1 ? 'term' : 'terms'})`;
        } 
        // For detail (expanded) view, show the query itself.
        else {
            collapsibleState = vscode.TreeItemCollapsibleState.None;
            label = esQuery.log;
        }
        super(label, collapsibleState);
        // This "tags" the tree item so that our custom context menu commands will show for it.
        this.contextValue = 'esQuery';
    }

    /**
     * Return a cURL representation of the underlying query.
     * @returns {String} - a cURL command representing a request for the underlying query.
     */
    getCurl(): string {
        return `curl http://localhost:9200/${this.esQuery.index}/${this.esQuery.type}/_search -d '${JSON.stringify(this.esQuery.body)}'`;
    }
}

  
  