import {
  buildMessage,
  getPullRequestsFromRepos,
  getReviwerObj,
  getReviwers,
  getReviwerCount,
} from './functions';
import * as dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL as string;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;

async function main() {
  try {
    const owner = 'the-pool';
    const repos: string[] = ['the-pool-api'];

    const pulls = await getPullRequestsFromRepos(owner, repos, GITHUB_TOKEN);

    const pendingPulls = pulls.filter((pull) => {
      return !pull.draft && pull.requested_reviewers.length;
    });

    const reviwers = getReviwers(pendingPulls);
    const reviewerObj = getReviwerObj();

    const reviewerCount = getReviwerCount(reviwers, reviewerObj);

    await buildMessage(WEBHOOK_URL, reviewerCount);
  } catch (error) {
    console.log(error);
  }
}

main();
