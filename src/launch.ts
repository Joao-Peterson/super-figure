import * as vscode from 'vscode';
import { exec } from 'child_process';
import { log } from './log';
import * as os from 'os';
import { evaluateVars } from './vars';
import * as p from 'path';

export enum imageType{
	vector,
	bitmap,
	unknown
}

export function execCmd(type: imageType, file: string): string{
	let cmd: string | undefined;
	let exe: string | undefined;

	// get executable and command
	switch(type){
		case imageType.vector:
			cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onVectorFileSave");
			exe = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFigureEditor");
			break;
		case imageType.bitmap:
			cmd = vscode.workspace.getConfiguration("super-figure").get<string>("onBitmapFileSave");
			exe = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFigureEditor")!;
			break;
	}

	// empty commands
	if(cmd == undefined || cmd.length == 0)
		return `No command 'onSave' was setup. File: '${file}'`;

	// empty exe
	if(exe == undefined || exe.length == 0)
		return `No executable for the file extension type was setup. File: '${file}'`;
	
	try {
		cmd = evaluateVars(cmd, file, exe);
		exec(cmd);				
		return `Executing command 'onSave': '${cmd}' for file: '${file}'`;
	} catch (error) {
		throw new Error(`Error while executing command '${cmd}' for file '${file}'. [ERROR]: ${error}`);
	}
}

export function launch(type: imageType, file: string, erroCb: ((error: string) => void)){
	// select executable
	let executable: string | undefined;
	let executableArgs: string | undefined;

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

	// execute
	try {
		let cmd: string;
		if(executable !== undefined && executableArgs !== undefined && executableArgs !== ""){
			cmd = evaluateVars("\"${executable}\"" + " " + executableArgs, file, executable);
		}
		else if(executable !== undefined){
			cmd = evaluateVars("\"${executable}\"", file, executable);
		}
		else{
			throw new Error(`Error, could not launch executable with provided arguments`);
		}
	
		exec(cmd, (err, stdout, stderr) => {
			if(err) 
				erroCb(err.message)
		});
	}
	catch(error){
		throw new Error(`Error while opening file '${file}' for editing with executable '${p.basename(executable!)}'. [ERROR]: ${error}`);
	}
}

export function getTypeByExtension(file: string): imageType{
	let ext = p.extname(file);
	ext = ext.replace(".", "");

	let vectors = vscode.workspace.getConfiguration("super-figure").get<string>("vectorFileExt")!;
	let bitmaps = vscode.workspace.getConfiguration("super-figure").get<string>("bitmapFileExt")!;

	// get type
	if(vectors.includes(ext)){
		return imageType.vector;
	}
	else if(bitmaps.includes(ext)){
		return imageType.bitmap;
	}
	else{
		return imageType.unknown;
	}
}