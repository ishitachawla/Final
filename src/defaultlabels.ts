import * as core from '@actions/core';
import { Octokit } from '@octokit/core';

export async function standardLabelsCheck(repository: string, ownername: string, secret_token: string, octokit: Octokit){
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
  