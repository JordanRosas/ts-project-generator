#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import chalk from 'chalk';

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));

const QUESTIONS = [
	{
		name:'template',
		type:'list',
		message:'What project tmeplate would you like to generate?',
		choices:CHOICES
	},
	{
		name:'name',
		type:'input',
		message:'Project name:'
	}
];

export interface CliOptions{
	projectName:string,
	templateName: string,
	templatePath:string,
	targetPath:string
}

const CURR_DIR = process.cwd();

const SKIP_FILES = ['node_modules', '.template.json'];

function createDirectoryContents(templatePath:string, projectName: string){
	const fileToCreate = fs.readdirSync(templatePath);

	fileToCreate.forEach(file => {
		const origFilePath = path.join(templatePath, file);
		const stats = fs.statSync(origFilePath);
		if(SKIP_FILES.indexOf(file) > -1) return;
		
		if (stats.isFile()){
			let contents = fs.readFileSync(origFilePath, 'utf8');
			
			const writePath = path.join(CURR_DIR, projectName, file);
			fs.writeFileSync(writePath, contents, 'utf8');

		}else if(stats.isDirectory()){
			fs.mkdirSync(path.join(CURR_DIR, projectName, file));
			createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
		}
	});
}

function createProject(projectPath:string){
	if(fs.existsSync(projectPath)){
		console.log(chalk.red('Folder ${projectPath} exists, Delete or use another name.'));
		return false;
	}
	fs.mkdirSync(projectPath);
	return true;
}



inquirer.prompt(QUESTIONS)
.then(answers => {
	console.log(answers)
	const projectChoice = answers['template'];
	const projectName = answers['name'];
	
	const templatePath = path.join(__dirname, 'templates, projectChoice');
	const targetPath = path.join(CURR_DIR, projectName);

	if(!createProject(targetPath)){
		return;
	}

	createDirectoryContents(templatePath, projectName);

	const options: CliOptions = {
        projectName,
        templateName: projectChoice,
        templatePath,
        targetPath
    }

	console.log(options);
})

