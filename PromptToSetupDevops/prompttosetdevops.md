I have defined my plan to implement devops in my project in the following way.  Act as a Devops expert and a Test Automation architect to review this plan. Let me know of any suggestions and best practices.
Confirm whether this flow will be an excellent flow to implement test automation execution in the devops cycle. If yes then implement the process and its components step by step on top of the existing setup or configuration.
Note – Use the Github MCP and Playwright MCP tools and any other tools if beneficial to carry out the implementation.
1.	Following is the application code repo which is used by the dev team for application development. 
https://github.com/harshpanditishu/practice-software-testing.git  
2.	All developers while working on a assigned task or user story create their own branch off the main branch. Naming convention of the branch is usually <username>_<user story number>.
3.	Once their code changes are done the code is pushed to the mapped remote tracking branch.
4.	The smoke test scripts execution will be triggered on execution of step 3 as per the setting or config mentioned in the github actions workflow file. The test scripts will be executed in the docker image. Make any changes to the workflow files as required to suffice this requirement. 
5.	Apart from MAIN branch there will be another branch named “Release”.
6.	Once the smoke test scripts in the CI CD pipeline pass the user will raise a PR to merge the code into the Release branch
7.	Once the Pull Request is raised the regression test scripts will be triggered via the related configuration in the github actions workflow file. The test scripts will be executed in the docker image.
Make any changes to the workflow files as required to suffice this requirement. 
8.	Once the regression test scripts in the CI CD pipeline pass and 1 code review is done by a code reviewer , only then  the user will be able to merge the code into the Release branch. 
9.	Any merge conflicts will be handled manually by the developer or development team
10.	Once the code is merged into the Release branch without any conflicts a PR will be raised to merge code from Release to Main branch.
11.	Once the Pull Request is raised the regression and smoke test scripts both, will be triggered via the related configuration in the github actions workflow file. The test scripts will be executed in the docker image.Make any changes to the workflow files as required to suffice this requirement. Add job for publishing and displaying test execution reports in the workflow file.
12.	Once the regression and smoke test scripts in the CI CD pipeline pass and 1 code review is done by a code reviewer , only then  the user will be able to merge the code into the MAIN branch.
13.	Any merge conflicts will be handled manually by the developer or development team
14.	Direct pushing of code from local working directory to remote main branch is prohibited. 
