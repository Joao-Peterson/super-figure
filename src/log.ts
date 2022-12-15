import * as vscode from 'vscode';

export let log: logT;

export function logInit(){
	log = new logT();
}

class logT{

	private output!: vscode.OutputChannel;
	
	constructor (){
		this.output = vscode.window.createOutputChannel("Super Figure");
	}

	info(msg: string){
		this.output.appendLine(msg);
	}
}
