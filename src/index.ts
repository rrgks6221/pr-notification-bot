import {
  sendMessage,
  getPullRequestsFromRepos,
  getReviwerObj,
  getReviwers,
  getReviwerCount,
} from './functions';
import * as dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL as string;

// 현재 이석호 개인 계정 토큰
// 개인 토큰이 아닌 팀 토큰으로 변경 필요
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN as string;

async function main() {
  try {
    const owner = 'the-pool';
    const repos: string[] = ['the-pool-api'];

    const pulls = await getPullRequestsFromRepos(owner, repos, DEVELOPER_TOKEN);

    const pendingPulls = pulls.filter((pull) => {
      return !pull.draft && pull.requested_reviewers.length;
    });

    const reviwers = getReviwers(pendingPulls);
    const reviewerObj = getReviwerObj();

    const reviewerCount = getReviwerCount(reviwers, reviewerObj);

    await sendMessage(WEBHOOK_URL, reviewerCount);
  } catch (error) {
    console.log(error);
  }
}

main();
