import * as vscode from 'vscode';
import * as path from 'path';


export class TCItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public status: number | string,
        public readonly item_type: number,
        public readonly tc_id: string,
        public readonly descr: string,
        public readonly command?: vscode.Command

    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    get description(): string {
        return this.descr;
    }

    private get_icons(type: string) {

        if (this.status === TCStatus.none) {
            if (this.item_type === TCType.BuildConfiguration) { return path.join(__filename, '..', '..', 'resources', type, `build_configuration.svg`); }
            if (this.item_type === TCType.Project) { return path.join(__filename, '..', '..', 'resources', type, `project.svg`); }
        }

        var folder: string = "";
        var icon_name: string = "";
        switch(this.status){
            case TCStatus.success + TCStatus.finished: {
                //1 success finished
                folder = 'green';
                icon_name = 'stop';
                break;
            }
            case TCStatus.fail + TCStatus.finished: {
                //2 fail finished
                folder = 'red';
                icon_name = 'stop';
                break;
            }
            case TCStatus.none + TCStatus.running:
            case TCStatus.success + TCStatus.running:
            case TCStatus.none + TCStatus.queued:
            case TCStatus.success + TCStatus.queued: {
                //3 success running
                //5 queued
                folder = 'green';
                icon_name = 'running';
                break;
            }
            case TCStatus.fail + TCStatus.running:
            case TCStatus.error + TCStatus.running:{
                //4 fail running
                //4 error running
                folder = 'red';
                icon_name = 'running';
                break;

            }
            case TCStatus.canceled + TCStatus.finished:{
                //cancel finished
                folder = type;
                icon_name = 'cancel';
                break;
        
            }
        }
        //console.log(folder, " ", icon_name);
        return path.join(__filename, '..', '..', 'resources', folder, `${icon_name}.svg`);
    }

    iconPath = {
        light: this.get_icons("light"),
        dark: this.get_icons("dark")
    };

    contextValue = TCType.get_string_type(this.item_type);
}

export class TCType {
    static readonly Project: number = 0;
    static readonly BuildConfiguration: number = 1;
    static get_string_type(type: number) {
        return type === TCType.Project ? "project" : "build_configuration";
    }
}

export class TCStatus {
    static readonly success: number = 101;    //SUCCESS
    static readonly fail: number = 102;       //FAILURE
    static readonly error: number = 103;      //ERROR
    static readonly canceled: number = 104;   //UKNOWN
    static readonly none: number = 0;
    static readonly queued: number = 201;     //queued
    static readonly running: number = 202;    //running
    static readonly finished: number = 205;   //finished
}
