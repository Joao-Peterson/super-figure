import * as vscode from 'vscode';
import { cacheFiles, cacheFilesInit } from './cacheFiles';
import { validateConfig } from './configValidate';
import { editFigure } from './editFigure';
import { log, logInit } from './log';
import { generateDefaultFiles } from './template';

export function activate(context: vscode.ExtensionContext) {
	
	// ------------------------------------------------ On active -----------------------------------------------

	// init
	logInit();
	log.info("Super figure extension activated");

	// create files
	generateDefaultFiles(context);
	
	// validate config
	validateConfig();

	// cache
	try {
		cacheFilesInit(context);	
	} 
	catch(e){
		vscode.window.showWarningMessage(`${e}`);
	}

	// ------------------------------------------------ Commands ------------------------------------------------

	let disposable = vscode.commands.registerTextEditorCommand('super-figure.editFigure', editFigure);
	context.subscriptions.push(disposable);

}

export function deactivate(){
	cacheFiles.dispose();
}
