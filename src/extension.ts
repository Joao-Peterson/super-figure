import * as vscode from 'vscode';
import { cacheFiles, cacheFilesInit } from './cacheFiles';
import { validateConfig } from './configValidate';
import { editBitmap, editFigure, editVector } from './editFigure';
import { log, logInit } from './log';
import { generateDefaultFiles } from './defaultFiles';

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

	let disposable: vscode.Disposable;

	disposable = vscode.commands.registerTextEditorCommand('super-figure.editFigure', editFigure);
	context.subscriptions.push(disposable);
	
	disposable = vscode.commands.registerTextEditorCommand('super-figure.editVector', editVector);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.editBitmap', editBitmap);
	context.subscriptions.push(disposable);

}

export function deactivate(){

}
