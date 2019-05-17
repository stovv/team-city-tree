import * as vscode from 'vscode';
import * as path from 'path';


export class TCItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public status: number,
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

        var stat = "";
        var icon_type = "";
        switch (this.status) {
            case TCStatus.Fail: {
                stat = "red_";
                type = "";
                break;
            }
            case TCStatus.Success: {
                stat = "green_";
                type = "";
                break;
            }
            case TCStatus.None: {
                stat = "";
                break;
            }
        }
        switch (this.item_type) {
            case TCType.BuildConfiguration: {
                icon_type = "build_configuration";
                break;
            }
            case TCType.Project: {
                icon_type = "project";
                break;
            }
        }
        return path.join(__filename, '..', '..', 'resources', type, `${stat}${icon_type}.svg`);

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
    static readonly Success: number = 0;
    static readonly Fail: number = 1;
    static readonly None: number = -1;
}
