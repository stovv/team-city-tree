
import * as vscode from 'vscode';

export interface Credentials {
    url: string | undefined;
    username: string | undefined;
    password: string | undefined;
}

async function showInputBox_(def_val: string, basicPrompt: string, placeHolder: string, hidden: boolean): Promise<string> {
    let fieldWasFilled: boolean = false;
    let operationWasAborted: boolean = false;
    var result;
    let prompt = basicPrompt;
    while (!fieldWasFilled && !operationWasAborted) {

        result = await vscode.window.showInputBox({
            value: def_val,
            prompt: prompt,
            placeHolder: placeHolder,
            password: hidden,
            ignoreFocusOut: true
        });
        operationWasAborted = result === undefined;
        fieldWasFilled = result !== "";
        prompt = `Error: ${basicPrompt}`;
    }
    if (!operationWasAborted) {
        return Promise.resolve<string>(String(result));
    } else {
        //vscode.window.showErrorMessage(basicPrompt);
        var err: Error = {
            name: basicPrompt,
            message: basicPrompt
        };
        return Promise.reject(err);
    }

}

export async function get_config(): Promise<Credentials> {

    // TODO: Save password after one provide it, and remove after log_out or deactivate
    var config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('tc_tree');
    var user: string | undefined = config.get("username");
    var password: string | undefined = config.get("password");
    var url: string | undefined = config.get("url");

    console.log(user, password, url);

    if (typeof password === "undefined") {
        password = await showInputBox_("", "Provide the password", "123456", true).then((passwd: string) => {
            return passwd;
        }).catch((basicPrompt: string) => {
            return undefined;
            //vscode.window.showErrorMessage("Password not provided, fill all lines in settings.json");
            //return Promise.reject(null);
        });
        if (typeof password === "undefined") {
            var err: Error = {
                name: "Password Not found",
                message: "Password not provided, fill all lines in settings.json"
            };
            return Promise.reject(err);
        }
    }

    if (typeof user !== "undefined" && typeof password !== "undefined" && typeof url !== "undefined") {
        var conf: Credentials = {
            url: url,
            username: user,
            password: password
        };
        return Promise.resolve(conf);
    }
    else {
        var err: Error = {
            name: "Not found",
            message: "Configuration not found, fill all lines in settings.json"
        };
        Promise.reject(err);
        //vscode.window.showErrorMessage("Configuration not found, fill all lines in settings.json");
    }
    return Promise.reject(null);

}