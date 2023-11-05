import * as vscode from 'vscode';
import * as p from 'path';
import * as editFigure from './editFigure';

export async function insertLatexVectorFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let selection = editor.document.getText(editor.selection);
	// if no filename
	if(selection.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}

	let snippet = "";
	snippet = snippet + `\\begin{figure}[ht]\n`;
	snippet = snippet + `\t\\centering\n`;
	snippet = snippet + `\t\\caption{}\n`;
	snippet = snippet + `\t%\\incsvg{path/}{path/file}\n`;
	snippet = snippet + `\t\\incsvg{${p.dirname(selection)}}{${selection}}\\\\\n`;
	snippet = snippet + `\t\\label{fig:${p.parse(selection).name}}\n`;
	snippet = snippet + `\\end{figure}`;
	
	edit.delete(editor.selection);
	edit.insert(editor.selection.start, snippet);

	editFigure.editVector(editor, edit, args);
}

export async function insertLatexBitmapFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let selection = editor.document.getText(editor.selection);
	// if no filename
	if(selection.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}

	let snippet = "";
	snippet = snippet + `\\begin{figure}[ht]\n`;
	snippet = snippet + `\t\\centering\n`;
	snippet = snippet + `\t\\caption{}\n`;
	snippet = snippet + `\t\\includegraphics[width=16cm]{${selection}.png}\\\\\n`;
	snippet = snippet + `\t\\label{fig:${p.parse(selection).name}}\n`;
	snippet = snippet + `\\end{figure}`;
	
	edit.delete(editor.selection);
	edit.insert(editor.selection.start, snippet);
	
	editFigure.editBitmap(editor, edit, args);
}

export async function insertLatexPre(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let selection = editor.document.getText(editor.selection);
	let snippet = "";
	snippet = snippet + `% generated by the Super Figure vscode extension. May we stand on the shoulder's of giants\n`;
	snippet = snippet + `\\usepackage{import}\n`;
	snippet = snippet + `\\newcommand{\\incsvg}[2]{%\n`;
	snippet = snippet + `\t\\def\\svgwidth{\\columnwidth}\n`;
	snippet = snippet + `\t\\graphicspath{{#1}}\n`;
	snippet = snippet + `\t\\input{#2.pdf_tex}\n`;
	snippet = snippet + `}`;
	edit.insert(editor.selection.start, snippet);
}

export async function insertMarkdownVectorFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let selection = editor.document.getText(editor.selection);
	// if no filename
	if(selection.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}

	let snippet = "";
	snippet = snippet + `![${p.basename(selection)}](${selection}.svg)`;
	
	edit.delete(editor.selection);
	edit.insert(editor.selection.start, snippet);
	
	editFigure.editVector(editor, edit, args);
}

export async function insertMarkdownBitmapFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let selection = editor.document.getText(editor.selection);

	// if no filename
	if(selection.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}

	let snippet = "";
	snippet = snippet + `![${p.basename(selection)}](${selection}.png)`;
	
	edit.delete(editor.selection);
	edit.insert(editor.selection.start, snippet);
	
	editFigure.editBitmap(editor, edit, args);
}
