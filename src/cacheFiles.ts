import * as vscode from 'vscode';
import * as p from 'path';
import { exec } from 'child_process';
export let cacheFiles: cacheFilesT;

export function cacheFilesInit(context: vscode.ExtensionContext){
	cacheFiles = new cacheFilesT(context);
}

export class cacheFilesT{
	private watcher: vscode.FileSystemWatcher; 
	private cache: string[];
	private vectors: string;
	private bitmaps: string;

	constructor( context: vscode.ExtensionContext){
		if(vscode.workspace.workspaceFolders === undefined){
			throw new Error("No folder is open, cannot watch files");
		}

		this.cache = vscode.workspace.getConfiguration(
			"super-figure", vscode.workspace.workspaceFolders![0]).get("filesToWatch")!;

		this.watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], "?"),
			true,
			false,
			false
		);

		this.watcher.onDidDelete(this.onDelete);
		this.watcher.onDidCreate(this.onSave);

		this.vectors = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFileExt")!;
		this.bitmaps = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFileExt")!;	
	}

	dispose(){
		this.watcher.dispose();
	}

	pull(){
		this.cache = vscode.workspace.getConfiguration(
			"super-figure", vscode.workspace.workspaceFolders![0]).get("filesToWatch")!;
	}

	push(){
		vscode.workspace.getConfiguration(
			"super-figure", vscode.workspace.workspaceFolders![0]).update("filesToWatch", this.cache, null);
	}

	insert(file: vscode.Uri){
		this.cache.push(file.path);
		this.push();
	}

	private onSave(file: vscode.Uri){
		this.pull();
		
		let path = file.path;

		// if marked
		if(this.cache.includes(path)){
			let ext = p.extname(path);
			ext = ext.replace(".", "");
			
			let cmd: string;
			// vector
			if(this.vectors.includes(ext)){
				cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onVectorFileSave")!;
			}
			// bitmap
			else if(this.bitmaps.includes(ext)){
				cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onBitmapFileSave")!;
			}
			else{
				return;
			}

			cmd = evaluateCommand(cmd, path);
			exec(cmd);				
		}
	}
	
	private onDelete(file: vscode.Uri){
		this.pull();
		
		this.cache.filter((value: string, index: number, obj: string[]) => {
			if(value === file.path)
				return false;
			else
				return true;
		});
		
		this.push();
	}
}

function evaluateCommand(command: string, file: string): string{
	command = command.replace("${file}", file);
	command = command.replace("${basename}", p.basename(file, p.extname(file)));
	command = command.replace("${dir}", p.dirname(file));
	return command.trim();
}