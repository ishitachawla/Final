import * as core from '@actions/core';
import * as fs from 'fs';
import { Octokit } from '@octokit/core';

export async function readmeChecks(repository: string, ownername: string, secret_token: string, octokit: Octokit) {
	try {
		const result = await octokit.request('GET /repos/{owner}/{repo}/readme', {
			repo: repository,
			owner: ownername,
			headers: {
				Authorization: 'Bearer ' + secret_token
			}
		});
		if (result.status == 200) {
			console.log('Success - README file is present');
			const current = await octokit.request('GET /repos/{owner}/{repo}/contents/README.md', {
				repo: repository,
				owner: ownername,
				headers: {
					Authorization: 'Bearer ' + secret_token
				}
			});
			let contents = Buffer.from(current.data.content, "base64").toString("utf8");
			if (contents.includes('Example')) {
				console.log('Success - Example workflow is present in README')
			}
			else {
				core.setFailed('Please add Example workflow in README');
			}
			if (contents.includes('Contribution') || contents.includes('Contributing')) {
				console.log('Success - Contribution Guidelines are present in README');
			}
			else {
				core.setFailed('Please add Contribution Guidelines in README');
			}
		}
		else {
			core.setFailed('Please add README file')
		}
	}
	catch (err) {
		console.log(err);
	}

}

export async function codeOwnerCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit) {
	try {
		const result = await octokit.request('GET /repos/{owner}/{repo}/contents/.github/CODEOWNERS', {
			repo: repository,
			owner: ownername,
			headers: {
				Authorization: 'Bearer ' + secret_token
			}
		});
		if(result.status = 200){
			console.log('Success - CODEOWNERS file is present');
		}
		else{
			core.setFailed('Please add CODEOWNERS file');
		}
	}
	catch (err) {
		console.log(err);
	}
}

function getExtension(filename: string) {
	return filename.substring(filename.lastIndexOf('.') + 1, filename.length)
}

export async function nodeModulesCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit) {
	try {
		const result = await octokit.request('GET /repos/{owner}/{repo}/languages', {
			repo: repository,
			owner: ownername,
			headers: {
				Authorization: 'Bearer ' + secret_token
			}
		});
		console.log(result.data);
		if(result.status=200){
			console.log('Success - CODEOWNERS file is present');
		}
		else{
			core.setFailed('Please add CODEOWNERS file');
		}
	}
	catch (err) {
		console.log(err);
	}
}

export async function releasesNodeModulesCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit) {
	try {
		const result = await octokit.request('GET /repos/{owner}/{repo}/branches', {
			owner: ownername,
			repo: repository,
			headers: {
				Authorization: 'Bearer ' + secret_token
			}
		});
		for (let i = 0; i < result.data.length; i++) {
			if (result.data[i].name.substring(0, 9) === 'releases/') {
				var branchname = result.data[i].name;
				const branch = await octokit.request('GET /repos/{owner}/{repo}/contents', {
					owner: ownername,
					repo: repository,
					ref: branchname,
					headers: {
						Authorization: 'Bearer ' + secret_token
					}
				})
				var flag = 0;
				for (let j = 0; j < branch.data.length; j++) {
					if (branch.data[j].name === 'node_modules') {
						flag = 1;
						console.log('Success - node_modules folder is present in ' + branchname);
					}
				}
				if (flag === 0) {
					core.setFailed('Please add node_modules to ' + branchname);
				}
			}
		}
	}
	catch (err) {
		console.log(err);
	}
}