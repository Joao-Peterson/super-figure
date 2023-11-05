import * as vscode from 'vscode';
import * as p from 'path';
import * as fs from 'fs';
import { log } from './log';
import { exec } from 'child_process';
import * as os from 'os';
import { cacheFiles } from './cacheFiles';
import { evaluateVars } from './vars';
import { defaultDir } from './defaultFiles';
import { findFileWorkspace, getFullpath, getPathRelativeToWorkspace, pathWithoutExt } from './pathUtils';
import { execCmd, getTypeByExtension, imageType, launch } from './launch';
import path = require('path');
import { join } from 'path';

// edit any figure, dropdown pick selection
export async function editFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	let pick = await vscode.window.showQuickPick(
		[
			{
				label: "Edit figure based on file extension.",
				detail: "File selection: (figure.svg)"
			},
			{
				label: "Edit Vector figure.",
				detail: "File selection: (figure)"
			},
			{
				label: "Edit Bitmap figure.",
				detail: "File selection: (figure)"
			}
		],
		{
			title: "Select how you want to edit the figure"
		}
	);
		
	if(pick === undefined) return;
		
	switch(pick.label){
		case "Edit figure based on file extension.":
			editFigureExtension(editor, edit, args);
			break;
		case "Edit Vector figure.":
			editVector(editor, edit, args);
			break;
		case "Edit Bitmap figure.":
			editBitmap(editor, edit, args);
			break;
		
		default:
			return;
	}
}

export async function renameFigure(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){
	// if no folder opened
	if(vscode.workspace.workspaceFolders === undefined){
		vscode.window.showErrorMessage(`No folders are opened. Cannot find files`);
		return;
	}

	let file = editor.document.getText(editor.selection);

	// if no filename
	if(file.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try giving it a name`);
		return;
	}
	
	// try {
	// 	edit.delete(editor.selection);
	// } catch (error) {
	// 	if(error instanceof Error){
	// 		log.info(error.message);
	// 	}				
	// }

	let oldFile: string; 
	try {
		// if file is image and doesn't exists
		oldFile = await findFileWorkspace(file);

		// get oldFile
		log.info(`Renaming file, match found for selection: "${file}". Match: "${oldFile}"`);

	} catch (error) {
		if (typeof(error) == "string"){
			vscode.window.showErrorMessage(error);
			return;
		}
	}

	// prompt user
	let inputRes = vscode.window.showInputBox(
		{
			value: "",
			title: `Rename file ${oldFile!} to:`
		}
	);

	// get new name
	let newFile: string;
	await inputRes.then((value) => {
		// on ESC
		if(value === undefined){
			return;
		} 
		else{
			newFile = value;
		}
	});

	// substitute selection
	await editor.edit(edit => {
		try {
			edit.delete(editor.selection);
			edit.insert(editor.selection.start, pathWithoutExt(newFile!));
		} catch (error) {
			if(error instanceof Error){
				log.info(error.message);
			}	
		}
	});
	
	// rename file
	try {
		fs.copyFileSync(getFullpath(oldFile!), getFullpath(newFile!));
		log.info(`File renamed to: '${newFile!}'`);
	} catch (error) {
		if(typeof(error) == "string"){
			vscode.window.showErrorMessage(`Error renaming file: '${oldFile!}' to '${newFile!}'`);
			log.info(`Error renaming file: '${oldFile!}' to '${newFile!}'`);
		}	
	}

	// re gen
	let type: imageType = getTypeByExtension(oldFile!);
	let ret: string | undefined;
	try {
		log.info(`Regenerating files`);
		ret = execCmd(type, getFullpath(newFile!));
	} catch (error) {
		if(typeof(error) == "string"){
			vscode.window.showErrorMessage(`Error generating files after rename`);
			log.info('Error generating files after rename');
		}
	}
	
	if(ret !== undefined)
		log.info(ret);

	// delete files
	let a = pathWithoutExt(oldFile!) + ".*";
	let files = await vscode.workspace.findFiles(a);

	try {
		for(let file of files){
			log.info(`Deleting file: ${file.fsPath}`);		
			vscode.workspace.fs.delete(file);
		}
	} catch (error) {
		log.info("Error while deleting files after rename command");
		throw new Error("Error while deleting files after rename command");
	}

	// add to cache
	try {
		let fullNew = getFullpath(newFile!);
		let fullOld = getFullpath(oldFile!);
		log.info(`Inserting file into cache: '${fullNew}'`);
		cacheFiles.insert(vscode.Uri.parse(fullNew));
		log.info(`Removing file from cache: '${fullOld}'`);
		cacheFiles.onDelete(vscode.Uri.parse(fullOld));
	} catch (error) {
		if(error instanceof Error){
			log.info(error.message);
		}
		else if(typeof(error) === 'string'){
			log.info(error);
		}
	}
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
export async function editFigureExtension(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]){	
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
	// if no filename
	if(file.length == 0){
		vscode.window.showErrorMessage(`Selected filename is null. Try typing and selecting an image path`);
		return;
	}

	// if file is image and doesn't exists
	let find = await vscode.workspace.findFiles(file, null, 1);
	if(find.length == 0){
		try {
			file = await createFromTemplate(type, file, template);
		}
		catch(e){
			// vscode.window.showWarningMessage(`${e}`);
			return;
		}
	}
	// if exists
	else{
		file = find[0].fsPath;	
	}

	// touch my friend, what the whole world, and the whole beasts of the nations desire, POWER!
	
	// open it

	let success = true;
	log.info(`Launching: '${file}'`);
	launch(type, file, (err) => {
		let msg = "Error launching: " + err;
		vscode.window.showErrorMessage(msg);
		log.info(msg);
		success = false;
	});

	if(!success)
		return;

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
		// check if folder is open, to get cwd
		if(vscode.workspace.workspaceFolders === undefined) throw new Error("No folder is opened, therefore no relative files can be created");
		// join relatives paths with workspace folder
		// let file_tmp = vscode.workspace.workspaceFolders![0].uri.path;
		// file = p.join(vscode.workspace.workspaceFolders![0].uri.path, file);
		let fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, file);

		input = input!.replace("~", os.homedir());
		let inputUri = vscode.Uri.parse(input);

		input = inputUri.fsPath;
		file = fileUri.fsPath;
		
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