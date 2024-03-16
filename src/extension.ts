import * as vscode from 'vscode';
import { cacheFilesInit } from './cacheFiles';
import { validateConfig } from './configValidate';
import * as editFigure from './editFigure';
import { log, logInit } from './log';
import { generateDefaultFiles } from './defaultFiles';
import { LatexSnippets } from './snippets/latex';
import { MarkdownSnippets } from './snippets/markdown';
import { TypstSnippets } from './snippets/typst';

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

	// edits

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

	// latex snippets
	
	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexVectorFigure', LatexSnippets.insertVectorFigure);
	context.subscriptions.push(disposable);
	
	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexBitmapFigure', LatexSnippets.insertBitmapFigure);
	context.subscriptions.push(disposable);
	
	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertLatexPre', LatexSnippets.insertPre);
	context.subscriptions.push(disposable);

	// typst snippets

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertTypstVectorFigure', TypstSnippets.insertVectorFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertTypstBitmapFigure', TypstSnippets.insertBitmapFigure);
	context.subscriptions.push(disposable);

	// markdown snippets

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertMarkdownVectorFigure', MarkdownSnippets.insertVectorFigure);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('super-figure.insertMarkdownBitmapFigure', MarkdownSnippets.insertBitmapFigure);
	context.subscriptions.push(disposable);
}

export function deactivate(){}
