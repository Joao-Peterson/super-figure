import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';

export function getPathRelativeToWorkspace(path: string): string{
	if (vscode.workspace.workspaceFolders === undefined) throw new Error("No folder is opened in vscode at the moment");
	return p.relative(vscode.workspace.workspaceFolders[0].uri.fsPath, path);
}

export async function findFileWorkspace(file: string): Promise<string>{
	let find: vscode.Uri[] | undefined;
	for (let i = 0; i < 2; i++) {
		switch (i) {
			// test selection assuming file extension
			case 0:
				find = await vscode.workspace.findFiles(file, null, 1);
				break;
				
			// test selection for any file extension
			case 1:
				find = await vscode.workspace.findFiles(file + `.*`);
				break;
		
			default:
				find = undefined;
				break;
		}
	
		// if match found
		if(find !== undefined && find.length != 0){
			break;
		}
	}

	// after all tests
	if(find === undefined){
		throw new Error(`No file was found for the selection made: "${file}"`);
	}

	let ret: string;

	// if multiple results
	if(find.length > 1){
		let fileList: string[] = []; 

		for(let file of find){
			fileList.push(getPathRelativeToWorkspace(file.fsPath));
		}
		
		let pick = await vscode.window.showQuickPick(fileList, {title: "Multiple files were found, select one:"});

		if(pick == undefined) throw new Error("No file was selected");

		ret = pick;
	}
	else{
		ret = getPathRelativeToWorkspace(find[0].fsPath);
	}

	return ret;
}

export function getFullpath(path: string): string{
	// gettings absolute paths
	// ~ is not expanded correctly by p.resolve()
	// check if folder is open, to get cwd

	if(vscode.workspace.workspaceFolders === undefined) throw new Error("No folder is opened, therefore no relative files can be created");
	// join relatives paths with workspace folder
	let pathUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, path);
	return pathUri.fsPath;
}

export function pathWithoutExt(path: string): string{
	let tmp = p.parse(path);
	return p.join(tmp.dir, tmp.name);
}