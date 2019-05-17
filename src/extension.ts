import * as vscode from 'vscode';
import * as credentials from './credentials';
import * as tc_actions from './tc_actions';
import { TeamCityNodeProvider } from './tc_tree';
import { TCItem } from './tc_objects';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "team-city-tree" is now active!');
	const tcNodeProvider = new TeamCityNodeProvider();
	vscode.window.registerTreeDataProvider('tc_tree', tcNodeProvider);
	vscode.commands.registerCommand('tc_tree.connect', async () => tc_actions.connect());
}

export function deactivate() {}
