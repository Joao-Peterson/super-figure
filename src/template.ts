import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { log } from './log';

export function generateDefaultFiles(context: vscode.ExtensionContext){
	try{
		let dir = createDefaultDir(context);
		copyTemplates(context, dir);
	}
	catch(e){
		log.info(`Error generating files. OS error: ${e}`);
		vscode.window.showErrorMessage(`Error generating files. OS error: ${e}`);
	}
}

function createDefaultDir(context: vscode.ExtensionContext): string{
	let dir = p.join(p.resolve(os.homedir()), "/.config/super-figure/templates/");
	try{
		fs.mkdirSync(dir, {recursive: true});
	}
	catch(e){
		log.info(`Could not create directory '${dir}'`);
		throw e;
	}
	
	return dir;
}

function copyTemplates(context: vscode.ExtensionContext, dir: string){
	
	let assets = fs.opendirSync(context.asAbsolutePath("assets/"));
	let entry = assets.readSync();
	
	while(entry !== null){
		if(entry.isFile()){
			try {
				fs.cpSync(
					context.asAbsolutePath("assets/" + entry.name),
					p.join(dir, entry.name)
				);
			} 
			catch(e){
				log.info(`Could not copy file '${entry.name}'`);
				throw e;
			}
		}

		entry = assets.readSync();
	}

	assets.close();
}