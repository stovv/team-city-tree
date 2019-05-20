import * as vscode from 'vscode';
import * as credentials from './credentials';
import { TCItem, TCType, TCStatus } from './tc_objects';
import * as tc_interfaces from './tc_interfaces';


var teamcity = require('teamcity-rest-api');

export async function connect() {
    return await credentials.get_config().then(async (config: credentials.Credentials) => {
        var client = teamcity.create(config);
        //console.log(config);
        var status: boolean = await client.getVersion().then((version: string) => {
            vscode.window.showInformationMessage("Connection is stable! 🔥");
            return true;
        }).catch((err: Error) => {
            //console.log(err);
            vscode.window.showErrorMessage("Connection is not stable! 😭");
            return false;
        });
        if (status) {
            return client;
        }
        return null;
    }).catch((err: Error) => {
        vscode.window.showErrorMessage("Connection is not stable! 😭 " + err.message);
        return null;
    });
}

export class TCActions {
    private client: any;
    public last_build_responce: string;

    constructor() {
        this.client = null;
        this.last_build_responce = "";

    }

    private async get_client(): Promise<any> {
        //console.log(this.client);
        if (this.client === null) {
            this.client = await connect();
            if (this.client === null) {
                Promise.reject(null);
            }
        }
        return Promise.resolve(this.client);
    }

    public clean_client() {
        this.client = null;
    }


    public async get_project(proj_id: string | Array<string>): Promise<TCItem[]> {

        return await this.get_client().then(async (client: any) => {
            const to_project = (label: string, status: number, tc_id: string, descr: string): TCItem => {
                return new TCItem(label, vscode.TreeItemCollapsibleState.Collapsed, status, TCType.Project, tc_id, descr, { command: "", title: '' });
            };
            const to_item = (label: string, status: number, tc_id: string, descr: string): TCItem => {
                //vscode.commands.registerCommand('go_to_' + tc_id, () => open_build(tc_id));
                return new TCItem(label, vscode.TreeItemCollapsibleState.None, status, TCType.BuildConfiguration, tc_id, descr,
                    {
                        command: "tc_build.open_build",
                        title: "TeamCity: Open Build",
                        arguments: [tc_id]
                    });
            };
            if (typeof proj_id === "string") {
                var items = client.projects.get({
                    id: proj_id
                }).then(function (project_: any) {
                    //console.log(JSON.stringify(project_, null, 2));
                    var project_data: TCItem[] = [];
                    var project_root: tc_interfaces.RootObject = project_;
                    if (project_root.projects.count !== 0) {
                        project_root.projects.project.forEach(function (proj: tc_interfaces.Project) {
                            project_data.push(to_project(proj.name, TCStatus.none, proj.id, ""));
                        });
                    }
                    if (project_root.buildTypes.count !== 0) {
                        project_root.buildTypes.buildType.forEach(function (build_type: tc_interfaces.BuildTypeItem) {
                            project_data.push(to_item(build_type.name, TCStatus.none, build_type.id, ""));
                        });
                    }
                    //console.log(project_data);
                    return project_data;
                }).catch(function (err: any) {
                    console.error(err.message);
                    return [];
                });
                return Promise.resolve(items);
            }
            else {
                var many_items: TCItem[] = [];
                for (var i = 0; i < proj_id.length; i++) {
                    var items_ = await client.projects.get({
                        id: proj_id[i]
                    }).then(function (project_: any) {
                        //console.log(JSON.stringify(project_, null, 2));
                        var project_data: TCItem[] = [];
                        var project_root: tc_interfaces.RootObject = project_;
                        if (project_root.projects.count !== 0) {
                            project_root.projects.project.forEach(function (proj: tc_interfaces.Project) {
                                project_data.push(to_project(proj.name, TCStatus.none, proj.id, ""));
                            });
                        }
                        if (project_root.buildTypes.count !== 0) {
                            project_root.buildTypes.buildType.forEach(function (build_type: tc_interfaces.BuildTypeItem) {
                                project_data.push(to_item(build_type.name, TCStatus.none, build_type.id, ""));
                            });
                        }
                        //console.log(project_data);
                        return project_data;
                    }).catch(function (err: any) {
                        console.error(err.message);
                        return [];
                    });
                    many_items = many_items.concat(items_);
                    //console.log(many_items);
                }
                //console.log("its many", many_items);
                return Promise.resolve(many_items);
            }
        }).catch(() => {
            Promise.resolve([]);
        });
    }

    public async get_build(build_id: string): Promise<TCItem[]> {
        console.log("build_id = ", build_id);
        const to_item = (label: string | any, status: number, tc_id: string | any, descr: string): TCItem => {
            return new TCItem(label, vscode.TreeItemCollapsibleState.None, status, TCType.BuildConfiguration, tc_id, descr,
                {
                    command: "",
                    title: "",
                    arguments: []
                });
        };
        return await this.get_client().then(async (client: any) => {
            var items: [TCItem[], string] = client.builds.getByBuildTypeWithCount({
                id: build_id
            }, { dimensions: { count: 10 } }).then(function (build: any) { //TODO set dimensions in settings.json

                var local_items = [];
                var buildTypes: tc_interfaces.BuildItems = build;
                var builds: tc_interfaces.BuildItem[] = buildTypes.build;

                for (var i = 0; i < build.build.length; i++) {
                    var status: number = TCStatus.none;
                    //console.log(builds[i].number, " ", builds[i].status, " ",builds[i].state);
                    if (builds[i].status === "SUCCESS") {
                        status = TCStatus.success;
                    } else if (builds[i].status === "FAILURE") {
                        status = TCStatus.fail;
                    } else if (builds[i].status === "ERROR") {
                        status = TCStatus.error;
                    } else if (builds[i].status === "UNKNOWN") {
                        status = TCStatus.canceled;
                    }

                    if (builds[i].state === "queued") {
                        status += TCStatus.queued;

                    } else if (builds[i].state === "running") {
                        status += TCStatus.running;

                    } else if (builds[i].state === "finished") {
                        status += TCStatus.finished;
                    }
                    local_items.push(to_item(builds[i].number, status, builds[i].id, ""));
                }
                return [local_items, JSON.stringify(build)];
            }).catch(function (err: any) {
                console.error(err.message);
                return [[], ""];
            });
            //console.log(items);
            this.last_build_responce = items[1];
            return Promise.resolve(items[0]);
        });
    }

    public async get_build_update(build_id: string): Promise<boolean> {
        var last = this.last_build_responce;
        return await this.get_client().then(async (client: any) => {
            var u_status = client.builds.getByBuildTypeWithCount({
                id: build_id
            }, { dimensions: { count: 10 } }).then(function (build: any) {
                var now_build: string = JSON.stringify(build);
                if (now_build === last){
                    return false;
                }else{
                    return true;
                }
            }).catch(function (err: any) {
                console.error(err.message);
                return true;
            });
            return Promise.resolve(u_status);
        });
    }

    public async get_project_update(proj_id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

}