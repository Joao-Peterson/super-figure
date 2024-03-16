import * as vscode from 'vscode';
import * as p from 'path';
import * as editFigure from '../editFigure';
import { insertSnippet } from './insertSnippet';

export class MarkdownSnippets{
	
	static async insertVectorFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
		insertSnippet(editor, edit, args, (selection) => `![${p.basename(selection)}](${selection}.svg)`);
		editFigure.editVector(editor, edit, args);
	}
	
	static async insertBitmapFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
		insertSnippet(editor, edit, args, (selection) => `![${p.basename(selection)}](${selection}.png)`);
		editFigure.editBitmap(editor, edit, args);
	}
}

