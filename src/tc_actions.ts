import * as vscode from 'vscode';
import * as credentials from './credentials';
import {TCItem, TCType, TCStatus} from './tc_objects';
import * as tc_interfaces from './tc_interfaces';


var teamcity = require('teamcity-rest-api');

export async function connect(){
    return await credentials.get_config().then(async (config: credentials.Credentials)=>{
        var client = teamcity.create(config);
        console.log(config);
        var status: boolean = await client.getVersion().then((version:string) => {
            vscode.window.showInformationMessage("Connection is stable! 🔥");
            return true;
        }).catch((err:Error) => {
            console.log(err);
            vscode.window.showErrorMessage("Connection is not stable! 😭"); 
            return false;
        });
        if (status){
            return client;
        }
        return null;
    }).catch((err: Error)=>{
        vscode.window.showErrorMessage("Connection is not stable! 😭 " + err.message);
        return null;
    });
}



export class TCActions{
    private client:any = null;

    constructor(){
        
    }

    private async get_client(): Promise<any>{
        console.log(this.client);
        if (this.client === null){
            this.client = await connect();
            if (this.client === null){
                Promise.reject(null);
            }
        }
        return Promise.resolve(this.client);
    }
    

    public async get_project(proj_id: string): Promise<TCItem[]> {

        return await this.get_client().then((client:any)=>{
            const to_project = (label: string, status: number, tc_id: string, descr: string): TCItem => {
                return new TCItem(label, vscode.TreeItemCollapsibleState.Collapsed, status, TCType.Project, tc_id, descr, { command: "tcTree.sign_in", title: 'Sign in' });
            };
            const to_item = (label: string, status: number, tc_id: string, descr: string): TCItem => {
                //vscode.commands.registerCommand('go_to_' + tc_id, () => open_build(tc_id));
                return new TCItem(label, vscode.TreeItemCollapsibleState.None, status, TCType.BuildConfiguration, tc_id, descr, { command: "", title: "" });
            };
            var ret_items = client.projects.get({
                id: proj_id
            }).then(function (project_: any) {
                //console.log(JSON.stringify(project_, null, 2));
                var project_data: TCItem[] = [];
                var project_root: tc_interfaces.RootObject = project_;
                if (project_root.projects.count !== 0) {
                    project_root.projects.project.forEach(function (proj: tc_interfaces.Project) {
                        project_data.push(to_project(proj.name, TCStatus.None, proj.id, ""));
                    });
                }
                if (project_root.buildTypes.count !== 0) {
                    project_root.buildTypes.buildType.forEach(function (build_type: tc_interfaces.BuildTypeItem) {
                        project_data.push(to_item(build_type.name, TCStatus.None, build_type.id, ""));
                    });
                }
                //console.log(project_data);
                return project_data;
            }).catch(function (err: any) {
                console.error(err.message);
                return [];
            });
            return Promise.resolve(ret_items);
        }).catch(()=>{
            Promise.resolve([]);
        });
    }

}