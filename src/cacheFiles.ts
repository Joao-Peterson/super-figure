import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { log } from './log';
import { evaluateVars } from './vars';
import { execCmd, imageType } from './launch';

export let cacheFiles: cacheFilesT;

export function cacheFilesInit(context: vscode.ExtensionContext){
	cacheFiles = new cacheFilesT(context);
}

export class cacheFilesT{
	private watcher: chokidar.FSWatcher; 
	private cache: string[];
	private vectors: string;
	private bitmaps: string;

	constructor( context: vscode.ExtensionContext){
		if(vscode.workspace.workspaceFolders === undefined){
			throw new Error("No folder is open, cannot watch files");
		}

		this.cache = vscode.workspace.getConfiguration(
			"super-figure", vscode.workspace.workspaceFolders![0]).get("filesToWatch")!;

		this.watcher = chokidar.watch(this.cache);
		this.watcher.on('all', onWatchEvent);

		this.vectors = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFileExt")!;
		this.bitmaps = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFileExt")!;	
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
		this.pull();
		if(!this.cache.includes(file.fsPath)){
			this.cache.push(file.fsPath);
			this.watcher.add(file.fsPath);
			this.push();
		}
	}

	onSave(file: vscode.Uri){
		this.pull();
		
		let path = file.fsPath;

		// if marked for watch
		if(this.cache.includes(path)){
			let ext = p.extname(path);
			ext = ext.replace(".", "");
			
			let type: imageType;

			//get type
			if(this.vectors.includes(ext)){
				type = imageType.vector;
			}
			else if(this.bitmaps.includes(ext)){
				type = imageType.bitmap;
			}
			else{
				return;
			}

			// execute onSave
			let ret: string;
			try {
				ret = execCmd(type, path.replaceAll("\\", "/"));
			} catch (error) {
				if (typeof(error) == 'string'){
					vscode.window.showErrorMessage(error);
					log.info(error);
					return;
				}
			}

			log.info(ret!);
		}
	}
	
	onDelete(file: vscode.Uri){
		this.pull();

		log.info(`Removing file :'${file.fsPath}' from cache`);
		this.cache = this.cache.filter((value: string, index: number, obj: string[]) => {
			if(value === file.fsPath)
				return false;
			else
				return true;
		});
		
		this.watcher.unwatch(file.fsPath);
		this.push();
	}
}

function onWatchEvent(eventName: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', path: string, stats?: fs.Stats){
	switch(eventName){
		case 'change':
			cacheFiles.onSave(vscode.Uri.file(path));
			break;
		case 'unlink':
			cacheFiles.onDelete(vscode.Uri.file(path));
			break;
	}
}
