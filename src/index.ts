import {
  sendMessage,
  getPullRequestsFromRepos,
  getReviewerObj,
  getReviewers,
  getReviewerCount,
} from './functions';
import * as dotenv from 'dotenv';
import { Pull, ReviewerForm } from './type';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL as string;

// 현재 이석호 개인 계정 토큰
// 개인 토큰이 아닌 팀 토큰으로 변경 필요
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN as string;

async function main() {
  try {
    // github owner
    const owner = 'the-pool';
    // collect pr repositories
    const repos: string[] = ['the-pool-api'];

    // all pull requests
    const pulls: Pull[] = await getPullRequestsFromRepos(
      owner,
      repos,
      DEVELOPER_TOKEN,
    );

    // pending and not draft pull requests
    const pendingPulls: Pull[] = pulls.filter((pull) => {
      return !pull.draft && pull.requested_reviewers.length;
    });

    // github userName
    const reviewers: string[] = getReviewers(pendingPulls);
    // { githubUserName: discordId }
    const reviewerObj: Record<string, string> = getReviewerObj();

    // { discordId: { count: pendingReviewCount } }
    const reviewerCount: ReviewerForm = getReviewerCount(
      reviewers,
      reviewerObj,
    );

    await sendMessage(WEBHOOK_URL, reviewerCount);
  } catch (error) {
    console.log(error);
  }
}

main();
