import * as vscode from 'vscode';
import { TCActions } from './tc_actions';
import { TeamCityProjectNodeProvider } from './tc_tree';
import { TeamCityBuildNodeProvider } from './tc_build';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	//console.log('Congratulations, your extension "team-city-tree" is now active!');

	var tc_actions = new TCActions();
	const tc_projectProvider = new TeamCityProjectNodeProvider(tc_actions);
	const tc_buidProvider = new TeamCityBuildNodeProvider(tc_actions);
	vscode.window.registerTreeDataProvider('tc_tree', tc_projectProvider);
	vscode.window.registerTreeDataProvider('tc_build', tc_buidProvider);
	//vscode.commands.registerCommand('tc_tree.connect', async () => tc_actions.connect());
	vscode.commands.registerCommand('tc_tree.refresh', () => tc_projectProvider.refresh());
	vscode.commands.registerCommand('tc_tree.update_login', () => tc_projectProvider.refresh_config());
	vscode.commands.registerCommand('tc_build.open_build', async (build_id:string) => tc_buidProvider.open_build(build_id));
	vscode.commands.registerCommand('tc_build.back', () =>tc_buidProvider.close_build());
	vscode.commands.registerCommand('tc_build.refresh', () => tc_buidProvider.refresh());
}

export function deactivate() {}
