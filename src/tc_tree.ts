import * as vscode from 'vscode';
import { TCItem } from './tc_objects';
import { TCActions } from './tc_actions';


export class TeamCityProjectNodeProvider implements vscode.TreeDataProvider<TCItem>{

    private _onDidChangeTreeData: vscode.EventEmitter<TCItem | undefined> = new vscode.EventEmitter<TCItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TCItem | undefined> = this._onDidChangeTreeData.event;
    private tc_act:TCActions;

    constructor(tc_action: TCActions) {
        this.tc_act = tc_action;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: TCItem):vscode.ProviderResult<TCItem[]> {
        if (element) {
            //console.log(element);
            return this.tc_act.get_project(element.tc_id);
        } else {
            var config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('tc_tree');
            var v_projects: Array<any> | undefined = config.get("visible");
            if (typeof v_projects === "undefined"){
                return this.tc_act.get_project("_Root");
            }else{
                var detted = this.tc_act.get_project(v_projects);
                //console.log(detted);
                return detted;
            }
        }
    }

    public refresh_config(){
        this.tc_act.clean_client();
        return this.refresh();
    }

    getTreeItem(element: TCItem): vscode.TreeItem {
        return element;
    }

}


