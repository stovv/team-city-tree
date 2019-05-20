import * as vscode from 'vscode';
import * as workerpoll from 'workerpool';
import { TCItem } from './tc_objects';
import { TCActions } from './tc_actions';
import { deflateSync } from 'zlib';


export class TeamCityBuildNodeProvider implements vscode.TreeDataProvider<TCItem>{

    private _onDidChangeTreeData: vscode.EventEmitter<TCItem | undefined> = new vscode.EventEmitter<TCItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TCItem | undefined> = this._onDidChangeTreeData.event;
    private tc_act: TCActions;
    private build_id: string;
    private autorefresh: boolean;

    constructor(tc_action: TCActions) {
        this.tc_act = tc_action;
        this.build_id = "";
        this.autorefresh = true;
    }


    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: TCItem): vscode.ProviderResult<TCItem[]> {
        //console.log("build id = ", this.build_id);
        if (this.build_id === ""){
            console.log("non build id");
            vscode.commands.executeCommand("setContext", "build", false);
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve(this.tc_act.get_build(this.build_id));
        }
        return Promise.resolve(this.tc_act.get_build(this.build_id));
    }

    getTreeItem(element: TCItem): vscode.TreeItem {
        return element;
    }
    sleep(ms:any) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async poll() {
        while (this.autorefresh) {
            await this.tc_act.get_build_update(this.build_id).then(async (status:boolean)=>{
                console.log(status)
                if (status){
                    //this.refresh();
                }

            }).catch(async (err: any) => {
            });
            await this.sleep(2000);
        }
    }

    async open_build(build_id: string) {
        this.build_id = build_id;
        this.refresh();
        this.autorefresh = true;
        vscode.commands.executeCommand("setContext", "build", true);
        this.poll();
    }
    async close_build() {
        //console.log("close_build");
        this.build_id = "";
        this.refresh();
        this.autorefresh = false;
    }



}


