"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const dotenv = require("dotenv");
const functions_1 = require("./functions");
const message_1 = require("./message");
dotenv.config();
const { GITHUB_TOKEN } = process.env;
async function main() {
    try {
        const messengerType = (0, core_1.getInput)('MESSENGER_TYPE', {
            required: false,
        });
        const owner = (0, core_1.getInput)('OWNER', {
            required: true,
        });
        const repos = (0, core_1.getInput)('REPOS', {
            required: true,
        }).split(',');
        const webhookUrl = (0, core_1.getInput)('WEBHOOK_URL', {
            required: true,
        });
        const githubMessengerMap = (0, core_1.getInput)('MESSENGER_GITHUB_MAP', {
            required: true,
        });
        console.info(`messenger type is ${messengerType}`);
        console.info(`owner is ${owner}`);
        console.info(`repos is ${repos}`);
        console.info(`githubMessengerMap is ${githubMessengerMap}`);
        const pulls = await (0, functions_1.getPullRequestsFromRepos)(owner, repos, GITHUB_TOKEN);
        console.log(pulls);
        const pendingPulls = (0, functions_1.getPendingPullRequests)(pulls);
        const reviewers = (0, functions_1.getReviewers)(pendingPulls);
        const reviewerObj = (0, functions_1.getReviewerObj)(githubMessengerMap);
        const reviewerForm = (0, functions_1.getReviewerForm)(reviewers, reviewerObj);
        const message = new message_1.Message(messengerType, webhookUrl);
        await message.send(reviewerForm);
        console.log(reviewerForm);
    }
    catch (error) {
        console.error(error);
    }
}
main();
//# sourceMappingURL=index.js.map