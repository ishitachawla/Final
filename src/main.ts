import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import { Octokit } from '@octokit/core';
import {branchPermissionCheck} from './branchPermission'
import {readmeChecks, codeOwnerCheck, nodeModulesCheck, releasesNodeModulesCheck} from './fileChecks'

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
      //check whether standard labels have been defined
      standardLabelsCheck(repository, ownername, secret_token, octokit);
    }
  })
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
    if(result.status == 204){
      console.log('Vulnerability bot is enabled');
    }
    else{
      core.setFailed('Please enable vulnerability bot');
    }
  }
  catch(err){
    core.setFailed('Please enable vulnerability bot');
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

function getExtension(filename: string) {
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length)   
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

async function standardLabelsCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit){
  try{
    const result = await octokit.request('GET /repos/{owner}/{repo}/labels',{
      repo: repository,
      owner: ownername,
      headers : { 
        Authorization: 'Bearer ' + secret_token,
      },
    }); 
    let labelArray = result.data;
    var map = new Map();
    var absentLabels = new Array();
    for(let i=0; i<labelArray.length; i++){
      map.set(labelArray[i].name , 1);
    }
    standardLabelsCheckHelper('need-to-triage', map, absentLabels);
    standardLabelsCheckHelper('idle', map, absentLabels);
    standardLabelsCheckHelper('question', map, absentLabels);
    standardLabelsCheckHelper('bug', map, absentLabels);
    standardLabelsCheckHelper('P0', map, absentLabels);
    standardLabelsCheckHelper('P1', map, absentLabels);
    standardLabelsCheckHelper('enhancement', map, absentLabels);
    standardLabelsCheckHelper('documentation', map, absentLabels);
    standardLabelsCheckHelper('backlog', map, absentLabels);
    standardLabelsCheckHelper('performance-issue', map, absentLabels);
    standardLabelsCheckHelper('waiting-for-customer', map, absentLabels);
    if(absentLabels.length==0){
      console.log('Standard labels are present')
    }
    else{
      let errorOutput = absentLabels[0];
      for(let i=1; i<absentLabels.length; i++){
        errorOutput = errorOutput + ', ' + absentLabels[i];
      }
      core.setFailed('Please add standard labels: '+ errorOutput);
    }
  }
  catch(err){
    core.setFailed('Please add standard labels');
  }
}

function standardLabelsCheckHelper(label: string, map: Map<string,number>, absentLabels: Array<string>){
  if(!map.has(label)){
    absentLabels.push(label);
  }
} 

main();