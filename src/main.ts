import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import { request } from '@octokit/request';
import { Octokit } from "@octokit/core";
fs.readdir('./', (err, files) => {
  console.log("entered");
  if (err)
    console.log(err);
  else {

    //readme checks
    readmeChecks(files);

    //code owners in .github
    codeownerCheck();

    //dont have node modules in master for .ts
    nodemodulesCheck();

    //check pr protection in branch
    start();
    
    }})

    function getExtension(filename: string) {
      return filename.substring(filename.lastIndexOf('.')+1, filename.length)   
    }

    function readmeChecks(files: string[]){

      const includesReadme = files.includes('README.md');
      if(includesReadme){
        console.log("Found readme");
        fs.readFile('./README.md', function (err, data) {
        //check example
        if(data.includes('Example'))
          console.log("found example");
        else
          console.log("Example not found");
                
      //check contribution
        if(data.includes('Contribution'))
          console.log("found contribution");
                 
        else
          console.log("Contribution not found");
      });
      }
      else
      console.log("No Readme");
    }

    function codeownerCheck(){
      fs.readdir('./.github', (err, files) => {
        const includesCodeOwners = files.includes('CODEOWNERS');
        if(includesCodeOwners)
          console.log("Code owners present");
        else
          console.log("code owners file absent");
      })
    }

    function nodemodulesCheck(){
      var flag=0;
    fs.readdir('./src',(err, filess ) => {
      for(let i = 0; i < filess.length; i++){
        if(getExtension(filess[i]) === "ts"){
          flag=1;
          fs.readdir('./', (err, files) => {
            const includesnm = files.includes('node_modules');
            if(includesnm)
              console.log("node_modules present in master");
            else
              console.log("node_modules not present in master");
          })
          break;
        }
      }
      if(flag===0)
        console.log("not dot ts");
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
        console.log(result);
        return result;
    }
        catch(err){
          console.log(err);
          return "error";
    }
        
          }

    
