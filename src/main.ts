import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import { request } from '@octokit/request';
import { Octokit } from "@octokit/core";
fs.readdir('./', (err, files) => {
  if (err)
    console.log(err);
  else {

    //Check for example and Contribution in README
    readmeChecks(files);

    //Check for CODEOWNERS file in .github folder
    codeownerCheck();

    //Check if nodemodules folder is present in master branch for typescript action
    nodemodulesCheck();

    //check for branch permissionsS
    start();
    
    }
  })

function getExtension(filename: string) {
  return filename.substring(filename.lastIndexOf('.')+1, filename.length)   
}

function readmeChecks(files: string[]){

  const includesReadme = files.includes('README.md');
  if(includesReadme){
    console.log("README file is present");
    fs.readFile('./README.md', function (err, data) {
    //check example
    if(data.includes('Example'))
      console.log("Example workflow is present in README");
    else
      core.setFailed("Please add Example workflow in README");
                
      //check contribution
    if(data.includes('Contribution'))
      console.log("Contribution is present in README");
                 
    else
      core.setFailed("Please add Contribution in README");
    });
  }
  else
    core.setFailed("Please add README file");
}

function codeownerCheck(){
  fs.readdir('./.github', (err, files) => {
    const includesCodeOwners = files.includes('CODEOWNERS');
    if(includesCodeOwners)
      console.log("CODEOWNERS file is present");
    else
      core.setFailed("Please add CODEOWNERS file");
  })
}

function nodemodulesCheck(){
  var flag=0;
  fs.readdir('./src',(err, filelist ) => {
  for(let i = 0; i < filelist.length; i++){
    if(getExtension(filelist[i]) === "ts"){
      flag=1;
      fs.readdir('./', (err, files) => {
        const includes_nodemodules = files.includes('node_modules');
        if(includes_nodemodules)
          core.setFailed("Please remove node_modules folder from master");
        else
          console.log("node_modules folder is not present in master");
          })
      break;
      }
    }
  })
}


async function start(){ 
  try{
    var secret_token = core.getInput('GITHUB_TOKEN');
    const octokit = new Octokit({
    auth: secret_token,
    });
    const repository = core.getInput('repo_name');
    const ownername = core.getInput('repo_owner');
    const branchname = core.getInput('repo_branch');
    const result = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews',{
      repo: repository,
      owner: ownername,
      branch: branchname,
      headers : { Authorization: 'Bearer ' + secret_token
           }
    }); 
    if(result.data.dismiss_stale_reviews===false)
      core.setFailed("Please enable Dismiss stale pull request approvals when new commits are pushed")
    if(result.data.require_code_owner_reviews===false)
      core.setFailed("Please enable Require review from Code Owners")
    if(result.data.dismiss_stale_reviews===true && result.data.require_code_owner_reviews===true)
      console.log("Require pull request reviews before merging is enabled");
    }
    
  catch(err){
    console.log(err);
    return "error";
  }
        
}

    
