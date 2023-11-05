import * as vscode from 'vscode';
import * as fs from 'fs';
import { log } from './log';

export function validateConfig(){
	let config = vscode.workspace.getConfiguration("super-figure").get("vectorFigureEditor");
	if(typeof(config) === "string"){
		if(config === ""){
			showConfigMessage("No executable defined for vector figure editing. Alter the 'super-figure.vectorFigureEditor' parameter");
			log.info("No executable defined for vector figure editing. Alter the 'super-figure.vectorFigureEditor' parameter");
		}
		else if(!fs.existsSync(config)){
			showConfigMessage(`Defined executable: 'super-figure.vectorFigureEditor': '${config}' doesn't exist`);
			log.info(`Defined executable: 'super-figure.vectorFigureEditor': '${config}' doesn't exist`);
		}
		else{
			log.info(`Executable for vector images: '${config}'`);
		}
	}
	
	config = vscode.workspace.getConfiguration("super-figure").get("bitmapFigureEditor");
	if(typeof(config) === "string"){
		if(config === ""){
			showConfigMessage("No executable defined for bitmap figure editing. Alter the 'super-figure.bitmapFigureEditor' parameter");
			log.info("No executable defined for bitmap figure editing. Alter the 'super-figure.bitmapFigureEditor' parameter");
		}
		else if(!fs.existsSync(config)){
			showConfigMessage(`Defined executable: 'super-figure.bitmapFigureEditor': '${config}' doesn't exist`);
			log.info(`Defined executable: 'super-figure.bitmapFigureEditor': '${config}' doesn't exist`);
		}
		else{
			log.info(`Executable for bitmap images: '${config}'`);
		}
	}
}

function showConfigMessage(msg: string){
	let opt = vscode.window.showWarningMessage(
		msg,
		"Open Settings (UI)", "Open Settings (JSON)"
	);

	opt.then((value) => {
		switch (value) {
			case "Open Settings (UI)":
				vscode.commands.executeCommand("workbench.action.openSettings", "super-figure");
				break;

			case "Open Settings (JSON)":
				vscode.commands.executeCommand("workbench.action.openSettingsJson");
				break;
		
			default:
				break;
		}
	});
}