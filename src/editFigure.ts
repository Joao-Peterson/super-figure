import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import { log } from './log';
import { exec } from 'child_process';
import * as os from 'os';
import { cacheFiles } from './cacheFiles';

enum imageType{
	vector,
	bitmap
}

export async function editFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	// grab selection
	let file = editor.document.getText(editor.selection);

	// check filetype
	let img: imageType | null;
	let ext = p.extname(file);
	ext = ext.replace(".", "");
	let vectors = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFileExt");
	let bitmaps = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFileExt");
	let executable: string | undefined;
	let executableArgs: string | undefined;

	// if vector
	if(vectors?.includes(ext)){
		img = imageType.vector;
		log.info(`File: ${file} as vector file.`);				
		executable = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditor");
		executableArgs = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditorArgs");
	}
	// bitmaps
	else if(bitmaps?.includes(ext)){
		img = imageType.bitmap;
		log.info(`File: ${file} as bitmap file.`);			
		executable = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFigureEditor");
		executableArgs = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFigureEditorArgs");
	}
	// none
	else{
		img = null;
		log.info(`File: ${file} is not a bitmap or vector file`);			
		vscode.window.showErrorMessage(`File '${file}' could not be opened. File type is not a bitmap or vector file`);
		return;
	}
	
	// if file is image and doesn't exists
	if(img != null && !fs.existsSync(p.resolve(file))){
		try {
			file = await createFromTemplate(img, file);
		}
		catch(e){
			vscode.window.showWarningMessage(`${e}`);
			return;
		}
	}
	
	// open it
	try {
		let cmd: string;
		if(executable !== undefined && executableArgs !== undefined && executableArgs !== ""){
			cmd = evaluateCommand('"' + executable + '"' + " " + executableArgs, file);
		}
		else if(executable !== undefined){
			cmd = evaluateCommand('"' + executable + '"', file);
		}
		else{
			log.info(`Error, could not launch vector editor`);
			vscode.window.showErrorMessage(`Error, could not launch vector editor`);
			return;
		}

		exec(cmd);
		log.info(`Launching: '${cmd}'`);
	}
	catch(error){
		log.info(`Error while opening file '${file}' for editing with executable '${p.basename(executable!)}'. [ERROR]: ${error}`);
		vscode.window.showErrorMessage(`Error while opening file '${file}' for editing with executable '${p.basename(executable!)}'. [ERROR]: ${error}`);
	}
	
	// save it to cache
	cacheFiles.insert(vscode.Uri.file(file));
}

async function createFromTemplate(img: imageType, file: string): Promise<string>{
	// select template
	let template: string | undefined;
	switch(img){
		case imageType.bitmap:
			template = vscode.workspace.getConfiguration("super-figure").get("bitmapTemplate");
			break;

		case imageType.vector:
			template = vscode.workspace.getConfiguration("super-figure").get("vectorTemplate");
			break;
	}

	let input: string;
	// if template is valid
	if(template !== undefined){
		log.info(`File '${file}' doesn't exists, using template '${template}'`);
		// prompt user
		let inputRes = vscode.window.showInputBox(
			{
				value: template,
				title: `File doesn't exists, create using '${p.basename(template)}'?`
			}
		);

		await inputRes.then((value) => {
			// on ESC
			if(value === undefined){
				throw new Error("File creation canceled");
			} 
			else{
				input = value;
			}
		});

		// gettings absolute paths
		// ~ is not expanded correctly by p.resolve()
		input = input!.replace("~", os.homedir());
		// check if folder is open, to get cwd
		if(vscode.workspace.workspaceFolders === undefined) throw new Error("No folder is opened, therefore no relative files can be created");
		// join relatives paths with workspace folder
		file = p.resolve(p.join(vscode.workspace.workspaceFolders![0].uri.path, file));
		
		log.info(`Copying from: '${input}' to: '${file}'`);
		try {
			// try to copy
			fs.cpSync(
				input,
				file
			);
		}
		catch(e){
			log.info(`Could not copy template file '${input!}'. Os Error: ${e}`);
			vscode.window.showErrorMessage(`Could not copy template file '${input!}'. Os Error: ${e}`);
			throw e;
		}

		return file;
	}
	else{
		log.info(`No template was specified for 'super-figure.${img.toString()}Template' config`);
		throw new Error("No template was specified for 'super-figure.${img.toString()}Template' config");
	}
}	

function evaluateCommand(command: string, file: string): string{
	command = command.replace("${file}", file);
	command = command.replace("${basename}", p.basename(file, p.extname(file)));
	command = command.replace("${dir}", p.dirname(file));
	return command.trim();
}