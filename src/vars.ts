import * as p from 'path';

export function evaluateVars(command: string, file: string, exe: string): string{
	command = command.replace("${file}", file);
	command = command.replace("${basename}", p.basename(file, p.extname(file)));
	command = command.replace("${dir}", p.dirname(file));
	command = command.replace("${executable}", exe);
	return command.trim();
}