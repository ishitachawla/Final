"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var fs = __importStar(require("fs"));
var core_1 = require("@octokit/core");
fs.readdir('./', function (err, files) {
    if (err)
        console.log(err);
    else {
        //Check for example and Contribution in README
        readmeChecks(files);
        //Check for CODEOWNERS file in .github folder
        codeownerCheck();
        //Check if nodemodules folder is present in master branch for typescript action
        nodemodulesCheck();
        //check for branch permissions in main
        start('main');
        //check for nodemodules folder in releases/*
        releasesfunc();
    }
});
function getExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
}
function readmeChecks(files) {
    var includesReadme = files.includes('README.md');
    if (includesReadme) {
        console.log("README file is present");
        fs.readFile('./README.md', function (err, data) {
            //check example
            if (data.includes('Example'))
                console.log("Example workflow is present in README");
            else
                core.setFailed("Please add Example workflow in README");
            //check contribution
            if (data.includes('Contribution'))
                console.log("Contribution is present in README");
            else
                core.setFailed("Please add Contribution in README");
        });
    }
    else
        core.setFailed("Please add README file");
}
function codeownerCheck() {
    fs.readdir('./.github', function (err, files) {
        var includesCodeOwners = files.includes('CODEOWNERS');
        if (includesCodeOwners)
            console.log("CODEOWNERS file is present");
        else
            core.setFailed("Please add CODEOWNERS file");
    });
}
function nodemodulesCheck() {
    fs.readdir('./src', function (err, filelist) {
        for (var i = 0; i < filelist.length; i++) {
            if (getExtension(filelist[i]) === "ts") {
                fs.readdir('./', function (err, files) {
                    var includes_nodemodules = files.includes('node_modules');
                    if (includes_nodemodules)
                        core.setFailed("Please remove node_modules folder from master");
                    else
                        console.log("node_modules folder is not present in master");
                });
                break;
            }
        }
    });
}
function start(branchname) {
    return __awaiter(this, void 0, void 0, function () {
        var secret_token, octokit, repository, ownername, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    secret_token = core.getInput('GITHUB_TOKEN');
                    octokit = new core_1.Octokit({
                        auth: secret_token,
                    });
                    repository = github.context.repo.repo;
                    ownername = github.context.repo.owner;
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews', {
                            repo: repository,
                            owner: ownername,
                            branch: branchname,
                            headers: { Authorization: 'Bearer ' + secret_token
                            }
                        })];
                case 1:
                    result = _a.sent();
                    if (result.data.dismiss_stale_reviews === false)
                        core.setFailed("Please enable Dismiss stale pull request approvals when new commits are pushed for " + branchname);
                    if (result.data.require_code_owner_reviews === false)
                        core.setFailed("Please enable Require review from Code Owners for " + branchname);
                    if (result.data.dismiss_stale_reviews === true && result.data.require_code_owner_reviews === true)
                        console.log("Require pull request reviews before merging is enabled for " + branchname);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [2 /*return*/, "error"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function releasesfunc() {
    return __awaiter(this, void 0, void 0, function () {
        var secret_token, octokit, repository, ownername, result, i, branchname, node, flag, j, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    secret_token = core.getInput('GITHUB_TOKEN');
                    octokit = new core_1.Octokit({
                        auth: secret_token,
                    });
                    repository = github.context.repo.repo;
                    ownername = github.context.repo.owner;
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/branches', {
                            owner: ownername,
                            repo: repository,
                            headers: { Authorization: 'Bearer ' + secret_token
                            }
                        })];
                case 1:
                    result = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < result.data.length)) return [3 /*break*/, 5];
                    if (!(result.data[i].name.substring(0, 9) === 'releases/')) return [3 /*break*/, 4];
                    branchname = result.data[i].name;
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/contents', {
                            owner: ownername,
                            repo: repository,
                            ref: branchname,
                            headers: { Authorization: 'Bearer ' + secret_token
                            }
                        })];
                case 3:
                    node = _a.sent();
                    flag = 0;
                    for (j = 0; j < node.data.length; j++) {
                        if (node.data[j].name === 'node_modules') {
                            flag = 1;
                            console.log("node_modules folder is present in " + branchname);
                        }
                    }
                    if (flag === 0)
                        core.setFailed("Please add node_modules to " + branchname);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [2 /*return*/, "error"];
                case 7: return [2 /*return*/];
            }
        });
    });
}
