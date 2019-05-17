import * as vscode from 'vscode';
import { TCItem } from './tc_objects';
import { TCActions } from './tc_actions';


export class TeamCityNodeProvider implements vscode.TreeDataProvider<TCItem>{

    private _onDidChangeTreeData: vscode.EventEmitter<TCItem | undefined> = new vscode.EventEmitter<TCItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TCItem | undefined> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: TCItem):vscode.ProviderResult<TCItem[]> {
        var tc = new TCActions();
        if (element) {
            return tc.get_project(element.tc_id);
        } else {
            return tc.get_project("_Root");
        }
    }

    getTreeItem(element: TCItem): vscode.TreeItem {
        return element;
    }

}


