"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var fs = require("fs");
var filePath = core.getInput('path');
var core_1 = require("@octokit/core");
fs.readdir('./', function (err, files) {
    console.log("entered");
    if (err)
        console.log(err);
    else {
        for (var i = 0; i < files.length; i++)
            console.log(files[i]);
        var includesReadme = files.includes('README.md');
        if (includesReadme) {
            console.log("Found readme");
            fs.readFile('./README.md', function (err, data) {
                //check example
                if (data.includes('Example'))
                    console.log("found example");
                else
                    console.log("Example not found");
                //check contribution
                if (data.includes('Contribution'))
                    console.log("found contribution");
                else
                    console.log("Contribution not found");
            });
        }
        else
            console.log("No Readme");
        //code owners in .github
        fs.readdir('./.github', function (err, files) {
            var includesCodeOwners = files.includes('CODEOWNERS');
            if (includesCodeOwners)
                console.log("Code owners present");
            else
                console.log("code owners file absent");
        });
        //dont have node modules in master for .ts
        var flag = 0;
        fs.readdir('./src', function (err, filess) {
            for (var i = 0; i < filess.length; i++) {
                if (getExtension(filess[i]) === "ts") {
                    flag = 1;
                    fs.readdir('./', function (err, files) {
                        var includesnm = files.includes('node_modules');
                        if (includesnm)
                            console.log("node_modules present in master");
                        else
                            console.log("node_modules not present in master");
                    });
                    break;
                }
            }
            if (flag === 0)
                console.log("not dot ts");
        });
        //check pr protection in branch
        start();
    }
});
function getExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var secret_token, octokit, repository, ownername, branchname, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    secret_token = core.getInput('GITHUB_TOKEN');
                    octokit = new core_1.Octokit({
                        auth: secret_token
                    });
                    repository = core.getInput('repo_name');
                    ownername = core.getInput('repo_owner');
                    branchname = core.getInput('repo_branch');
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews', {
                            repo: repository,
                            owner: ownername,
                            branch: branchname,
                            headers: { Authorization: 'Bearer ' + secret_token
                            }
                        })];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/, result];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [2 /*return*/, "error"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
