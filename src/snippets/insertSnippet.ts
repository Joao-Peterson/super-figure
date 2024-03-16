import * as vscode from 'vscode';

export async function insertSnippet(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[], snippet: (selection: string) => string){
	let selection = editor.document.getText(editor.selection);

	// if no filename
	if(selection.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}

	edit.delete(editor.selection);

	// insert snippet
	edit.insert(editor.selection.start, snippet(selection));
}
