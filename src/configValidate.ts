import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import { log } from './log';

export function validateConfig(){
	let config = vscode.workspace.getConfiguration("super-figure").get("vectorFigureEditor");
	if(typeof(config) === "string"){
		let app = "";

		if(config === ""){
			log.info("No executable was defined for vector figure editing. Setting one");
			
			switch(os.platform()){
				case 'win32':
					app = "C:/Program Files/Inkscape/bin/inkscape.exe";
					vscode.workspace.getConfiguration("super-figure").update("vectorFigureEditor", app, true);
					break;
				case 'linux':
					app = "/usr/bin/inkscape";
					vscode.workspace.getConfiguration("super-figure").update("vectorFigureEditor", app, true);
					break;

				default:
					showConfigMessage(`Vector image editor could not be inferred for your OS, please set up the program manually!`);
					log.info(`Vector image editor could not be inferred for your OS, please set up the program manually!`);
					break;
			}
		}
		else{
			app = config;
		}

		if(!fs.existsSync(app)){
			showConfigMessage(`Defined executable: 'super-figure.vectorFigureEditor': '${app}' doesn't exist`);
			log.info(`Defined executable: 'super-figure.vectorFigureEditor': '${app}' doesn't exist`);
		}
		else{
			log.info(`Executable for vector images: '${app}'`);
		}
	}
	
	config = vscode.workspace.getConfiguration("super-figure").get("bitmapFigureEditor");
	if(typeof(config) === "string"){
		let app = "";

		if(config === ""){
			log.info("No executable was defined for bitmap figure editing. Setting one");
			
			switch(os.platform()){
				case 'win32':
					app = "C:/Program Files/GIMP 2/bin/gimp-2.10.exe";
					vscode.workspace.getConfiguration("super-figure").update("bitmapFigureEditor", app, true);
					break;
				case 'linux':
					app = "/usr/bin/gimp";
					vscode.workspace.getConfiguration("super-figure").update("bitmapFigureEditor", app, true);
					break;

				default:
					showConfigMessage(`Bitmap image editor could not be inferred for your OS, please set up the program manually!`);
					log.info(`Bitmap image editor could not be inferred for your OS, please set up the program manually!`);
					break;
			}
		}
		else{
			app = config;
		}

		if(!fs.existsSync(app)){
			showConfigMessage(`Defined executable: 'super-figure.bitmapFigureEditor': '${app}' doesn't exist`);
			log.info(`Defined executable: 'super-figure.bitmapFigureEditor': '${app}' doesn't exist`);
		}
		else{
			log.info(`Executable for bitmap images: '${app}'`);
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