const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const filePath = core.getInput('path')
const { request } = require('@octokit/request');
const { Octokit } = require("@octokit/core");
fs.readdir('./', (err, files) => {

  if (err)
    console.log(err);
  else {
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

      //code owners in .github

    fs.readdir('./.github', (err, files) => {
      const includesCodeOwners = files.includes('CODEOWNERS');
      if(includesCodeOwners)
        console.log("Code owners present");
      else
        console.log("code owners file absent");
    })


  //check brnch protection
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
      start();
    
    }})
