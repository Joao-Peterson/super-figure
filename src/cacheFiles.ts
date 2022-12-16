import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { log } from './log';
import { evaluateCommand } from './command';

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
		if(!this.cache.includes(file.path)){
			this.cache.push(file.path);
			this.watcher.add(file.path);
			this.push();
		}
	}

	onSave(file: vscode.Uri){
		this.pull();
		
		let path = file.path;

		// if marked
		if(this.cache.includes(path)){
			let ext = p.extname(path);
			ext = ext.replace(".", "");
			
			let cmd: string | undefined;
			let exe: string;
			// vector
			if(this.vectors.includes(ext)){
				cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onVectorFileSave");
				exe = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditor")!;
			}
			// bitmap
			else if(this.bitmaps.includes(ext)){
				cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onBitmapFileSave");
				exe = vscode.workspace.getConfiguration("super-figure").get<string>("vitmapFigureEditor")!;
			}
			else{
				return;
			}

			if(cmd !== undefined && cmd !== ""){
				cmd = evaluateCommand(cmd, path, exe);
				log.info(`Executing command onSave:'${cmd}' for file: '${path}'`);
				exec(cmd);				
			}
			else{
				log.info(`No command onSave was setup. File: '${path}'`);
			}
		}
	}
	
	onDelete(file: vscode.Uri){
		this.pull();

		log.info(`Removing file :'${file.path}' from cache`);
		this.cache = this.cache.filter((value: string, index: number, obj: string[]) => {
			if(value === file.path)
				return false;
			else
				return true;
		});
		
		this.watcher.unwatch(file.path);
		this.push();
	}
}

function onWatchEvent(eventName: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', path: string, stats?: fs.Stats){
	switch(eventName){
		case 'change':
			cacheFiles.onSave(vscode.Uri.file(path));
			break
		case 'unlink':
			cacheFiles.onDelete(vscode.Uri.file(path));
			break
	}
}
