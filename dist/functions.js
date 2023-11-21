"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewerForm = exports.getReviewerObj = exports.getReviewers = exports.getPendingPullRequests = exports.getPullRequestsFromRepos = void 0;
const axios_1 = require("axios");
const getPullRequestsFromRepos = async (owner, repos, token) => {
    const headers = token ? { Authorization: `token ${token}` } : undefined;
    const promisesResponse = repos.map((repo) => {
        return axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
            headers,
        });
    });
    const responses = await Promise.all(promisesResponse);
    const pulls = responses.reduce((acc, response) => {
        const { data: datas } = response;
        acc.push(...datas.map((data) => {
            const { url, assignees, requested_reviewers, draft } = data;
            return {
                url,
                assignees,
                requested_reviewers,
                draft,
            };
        }));
        return acc;
    }, []);
    return pulls;
};
exports.getPullRequestsFromRepos = getPullRequestsFromRepos;
const getPendingPullRequests = (pulls) => {
    return pulls.filter((pull) => {
        return !pull.draft && pull.requested_reviewers.length;
    });
};
exports.getPendingPullRequests = getPendingPullRequests;
const getReviewers = (pulls) => {
    return pulls.reduce((acc, cur) => {
        const { requested_reviewers } = cur;
        acc.push(...requested_reviewers.map((requestedReviewer) => {
            return requestedReviewer.login;
        }));
        return acc;
    }, []);
};
exports.getReviewers = getReviewers;
const getReviewerObj = (reviewer) => {
    return reviewer
        .split(',')
        .reduce((acc, cur) => {
        const [githubUserName, messengerId] = cur.split(':');
        acc[githubUserName] = messengerId;
        return acc;
    }, {});
};
exports.getReviewerObj = getReviewerObj;
const getReviewerForm = (reviewers, reviewerObj) => {
    const reviewerForm = {};
    Object.entries(reviewerObj).forEach(([githubUserName, messengerId]) => {
        if (!reviewers.includes(githubUserName))
            return;
        reviewerForm[messengerId] = {
            count: reviewers.filter((reviewer) => {
                return reviewer === githubUserName;
            }).length,
        };
    });
    return reviewerForm;
};
exports.getReviewerForm = getReviewerForm;
//# sourceMappingURL=functions.js.map