import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import { log } from './log';
import { exec } from 'child_process';
import * as os from 'os';
import { cacheFiles } from './cacheFiles';
import { evaluateCommand } from './command';
import { defaultDir } from './defaultFiles';

enum imageType{
	vector,
	bitmap
}

// edit vector figure
export async function editVector(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let template = vscode.workspace.getConfiguration("super-figure").get<string>("vectorTemplate");
	if(template === undefined) return;
	
	log.info(`Editing vector figure: ${editor.document.getText(editor.selection)}`);

	let file = editor.document.getText(editor.selection) + p.extname(template);
	handleFigure(imageType.vector, file, template);
}

// edit bitmap figure
export async function editBitmap(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let template = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapTemplate");
	if(template === undefined) return;
	
	log.info(`Editing bitmap figure: ${editor.document.getText(editor.selection)}`);

	let file = editor.document.getText(editor.selection) + p.extname(template);
	handleFigure(imageType.bitmap, file, template);
}

// edit figure based on file extension
export async function editFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){	
	// grab selection
	let file = editor.document.getText(editor.selection);

	// check filetype
	let img: imageType | null;
	let ext = p.extname(file);
	ext = ext.replace(".", "");
	let vectors = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFileExt");
	let bitmaps = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFileExt");
	
	// if vector
	if(vectors?.includes(ext)){
		img = imageType.vector;
		log.info(`File: ${file} is vector file.`);				
	}
	// bitmaps
	else if(bitmaps?.includes(ext)){
		img = imageType.bitmap;
		log.info(`File: ${file} is bitmap file.`);			
	}
	// none
	else{
		img = null;
		log.info(`File: ${file} is not a bitmap or vector file`);			
		vscode.window.showErrorMessage(`File '${file}' could not be opened. File type is not a bitmap or vector file`);
		return;
	}

	// select template
	let template: string | undefined;
	
	// try looking for a template of same file extension
	template = p.join(defaultDir(), "template." + ext);

	// if not then use preferred template
	if(!fs.existsSync(template)){
		switch(img){
			case imageType.bitmap:
				template = vscode.workspace.getConfiguration("super-figure").get("bitmapTemplate");
				break;
	
			case imageType.vector:
				template = vscode.workspace.getConfiguration("super-figure").get("vectorTemplate");
				break;
		}
	}
	
	// handle figure, create from template, launch editor
	handleFigure(img, file, template);
}

// handle figure, create from template, launch editor
async function handleFigure(type: imageType, file: string, template: string | undefined){
	// if no folder opened
	if(vscode.workspace.workspaceFolders === undefined){
		vscode.window.showErrorMessage(`No folders are opened. Cannot find files`);
		return;
	}

	// if file is image and doesn't exists
	let find = await vscode.workspace.findFiles(file, null, 1);
	if(find.length == 0){
		try {
			file = await createFromTemplate(type, file, template);
		}
		catch(e){
			vscode.window.showWarningMessage(`${e}`);
			return;
		}
	}
	// if exists
	else{
		file = find[0].path;	
	}
	
	
	let executable: string | undefined;
	let executableArgs: string | undefined;

	// select executable
	switch(type){
		case imageType.vector:
			executable = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditor");
			executableArgs = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditorArgs");
			break;
		case imageType.bitmap:
			executable = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFigureEditor");
			executableArgs = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFigureEditorArgs");
			break;
	}

	// open it
	try {
		let cmd: string;
		if(executable !== undefined && executableArgs !== undefined && executableArgs !== ""){
			cmd = evaluateCommand('"' + executable + '"' + " " + executableArgs, file, executable);
		}
		else if(executable !== undefined){
			cmd = evaluateCommand('"' + executable + '"', file, executable);
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

// receives type of image, vector or bitmap, copies a template file to 'file' an return absolute path to 'file'
async function createFromTemplate(img: imageType, file: string, template: string | undefined): Promise<string>{

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