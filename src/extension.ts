import * as vscode from 'vscode';
import { cacheFiles, cacheFilesInit } from './cacheFiles';
import { validateConfig } from './configValidate';
import * as editFigure from './editFigure';
import * as insertSnippet from './insertSnippet';
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

	disposable = vscode.commands.registerTextEditorCommand('super-figure.editFigure', editFigure.editFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.renameFigure', editFigure.renameFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.editFigureExtension', editFigure.editFigureExtension);
	context.subscriptions.push(disposable);
	
	disposable = vscode.commands.registerTextEditorCommand('super-figure.editVector', editFigure.editVector);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.editBitmap', editFigure.editBitmap);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexVectorFigure', insertSnippet.insertLatexVectorFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexBitmapFigure', insertSnippet.insertLatexBitmapFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexPre', insertSnippet.insertLatexPre);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertMarkdownVectorFigure', insertSnippet.insertMarkdownVectorFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertMarkdownBitmapFigure', insertSnippet.insertMarkdownBitmapFigure);
	context.subscriptions.push(disposable);
}

export function deactivate(){

}
