import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import { request } from '@octokit/request';
import { Octokit } from '@octokit/core';

async function main() { 
  fs.readdir('./', (err, files) => {
    if (err){
      console.log(err);
    }
    else{
      var secret_token = core.getInput('GITHUB_TOKEN');
      const octokit = new Octokit({
      auth: secret_token,
      });
      const repository = github.context.repo.repo;
      const ownername = github.context.repo.owner;
      //Check for example and Contribution in README
      readmeChecks(files);
      //Check for CODEOWNERS file in .github folder
      codeOwnerCheck();
      //Check if nodemodules folder is present in master branch for typescript action
      nodeModulesCheck();
      //check for branch permissions in main/master and releases/*
      branchPermissionCheck(repository, ownername, secret_token, octokit);
      //check for nodemodules folder in releases/*
      releasesNodeModulesCheck(repository, ownername, secret_token, octokit);
      //check for security/vulnerability bot
      vulnerabilityBotCheck(repository, ownername, secret_token, octokit);
      //1. check whether issue-template has been set up and 2. default label is need-to-triage
      issueTemplateCheck();
    }
  })
}

function readmeChecks(files: string[]){
  const includesReadme = files.includes('README.md');
  if(includesReadme){
    console.log('README file is present');
    fs.readFile('./README.md', function (err, data) {
    //check example
    if(data.includes('Example')){
      console.log('Example workflow is present in README');
    }
    else{
      core.setFailed('Please add Example workflow in README');
    }            
      //check contribution
    if(data.includes('Contribution')){
      console.log('Contribution is present in README');
    }             
    else{
      core.setFailed('Please add Contribution in README');
    }
    });
  }
  else{
    core.setFailed('Please add README file');
  }
}

function codeOwnerCheck(){
  fs.readdir('./.github', (err, files) => {
    const includesCodeOwners = files.includes('CODEOWNERS');
    if(includesCodeOwners){
      console.log('CODEOWNERS file is present');
    }
    else{
      core.setFailed('Please add CODEOWNERS file');
    }
  })
}

function getExtension(filename: string) {
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length)   
}

function nodeModulesCheck(){
  fs.readdir('./src',(err, filelist ) => {
  for(let i = 0; i < filelist.length; i++){
    if(getExtension(filelist[i]) === 'ts'){
      fs.readdir('./', (err, files) => {
        const includes_node_modules = files.includes('node_modules');
        if(includes_node_modules){
          core.setFailed('Please remove node_modules folder from master');
        }
        else{
          console.log('node_modules folder is not present in master');
        }
      })
      break;
    }
  }
  })
}

async function branchPermissionCheckHelper(branchname: string, repository: string, ownername: string, secret_token: string, octokit: Octokit){ 
  try{
    const result = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews',{
      repo: repository,
      owner: ownername,
      branch: branchname,
      headers : { Authorization: 'Bearer ' + secret_token
      }
    }); 
    if(result.data.require_code_owner_reviews === false){
      core.setFailed('Please enable Require review from Code Owners for '+ branchname)
    }
    else{
      console.log('Require pull request reviews before merging is enabled for '+ branchname);
    }
  } 
  catch(err){
    core.setFailed('Please enable Require review from Code Owners for '+ branchname)
  }        
}

async function branchPermissionCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit){
  try{
    const result = await octokit.request('GET /repos/{owner}/{repo}/branches',{
      owner: ownername,
      repo: repository,
      headers : { Authorization: 'Bearer ' + secret_token
      }
    });
    for(let i=0;i<result.data.length;i++){
      if(result.data[i].name.substring(0,9) === 'releases/' || result.data[i].name === 'main' || result.data[i].name === 'master' ){
        var branchname = result.data[i].name;
        branchPermissionCheckHelper(branchname, repository, ownername, secret_token, octokit);
      }
    }
  }
  catch(err){
    console.log(err);
  }
}

async function releasesNodeModulesCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit){ 
  try{
    const result = await octokit.request('GET /repos/{owner}/{repo}/branches',{
      owner: ownername,
      repo: repository,
      headers : { Authorization: 'Bearer ' + secret_token
      }
    });
    for(let i=0;i<result.data.length;i++){
      if(result.data[i].name.substring(0,9) === 'releases/'){
        var branchname = result.data[i].name;
        const branch = await octokit.request('GET /repos/{owner}/{repo}/contents',{
          owner: ownername,
          repo: repository,
          ref: branchname,
          headers : { Authorization: 'Bearer ' + secret_token
          }
        })
        var flag=0;
        for(let j=0;j<branch.data.length;j++){
          if(branch.data[j].name === 'node_modules'){
            flag=1;
            console.log('node_modules folder is present in '+ branchname);
          } 
        }
        if(flag===0){
          core.setFailed('Please add node_modules to '+ branchname);
        }
      }
    }
  }
  catch(err){
    console.log(err);
  }       
}
async function vulnerabilityBotCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit) {
  try{
    const result = await octokit.request('GET /repos/{owner}/{repo}/vulnerability-alerts',{
      repo: repository,
      owner: ownername,
      headers : { 
        Authorization: 'Bearer ' + secret_token,
      },
      mediaType: {
        previews: [
          'dorian'
        ]
      }
    }); 
    if(result.data === 'undefined'){
      console.log('Vulnerability bot is enabled');
    }
    else{
      core.setFailed('Please enable vulnerability bot');
    }
  }
  catch(err){
    console.log(err);
  }
}

function issueTemplateCheck() {
  fs.readdir('./.github',(err, folders ) => {
    const includesISSUE_TEMPLATE = folders.includes('ISSUE_TEMPLATE');
    if(includesISSUE_TEMPLATE){
      console.log('ISSUE_TEMPLATE is set up');
      defaultLabelCheck();
    }
    else{
      core.setFailed('Please set up ISSUE_TEMPLATE');
    }
  })
}

function defaultLabelCheck(){
  fs.readdir('./.github/ISSUE_TEMPLATE',(err, filelist ) => {
    let i=0;
    while( i < filelist.length ){
      if(getExtension(filelist[i]) === 'md'){
        let data = fs.readFileSync('./.github/ISSUE_TEMPLATE/'+filelist[i]) 
          if(data.includes('need-to-triage')){
            console.log('Default label is need-to-triage');
            break;
          }
      }
      i++;
    }
    if(i==filelist.length)
      core.setFailed('Please set default label as need-to-triage')
  })
}
main();
