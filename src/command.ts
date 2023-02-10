import * as p from 'path';

export function evaluateCommand(command: string, file: string, exe: string): string{
	command = command.replace("${file}", wrapQuotes(file));
	command = command.replace("${basename}", wrapQuotes(p.basename(file, p.extname(file))));
	command = command.replace("${dir}", wrapQuotes(p.dirname(file)));
	command = command.replace("${executable}", wrapQuotes(exe));
	return command.trim();
}

function wrapQuotes(str: string): string{
	return '"' + str + '"';
}