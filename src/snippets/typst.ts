import * as vscode from 'vscode';
import * as p from 'path';
import * as editFigure from '../editFigure';
import { insertSnippet } from './insertSnippet';

export class TypstSnippets{
	
	static async insertVectorFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
		insertSnippet(editor, edit, args, (selection) => `#image("${selection}.svg")`);
		editFigure.editVector(editor, edit, args);
	}
	
	static async insertBitmapFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
		insertSnippet(editor, edit, args, (selection) => `#image("${selection}.png")`);
		editFigure.editBitmap(editor, edit, args);
	}
}

