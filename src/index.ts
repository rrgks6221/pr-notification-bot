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

// 토큰을 주지 않을경우 rate limit 에 걸려 알림이 오지 않을수도 있습니다.
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;

async function main() {
  try {
    // github owner
    // https://github.com/rrgks6221/pr-notification-bot => rrgks6221
    const owner = 'rrgks6221';
    // collect pr repositories
    const repos: string[] = ['pr-notification-bot'];

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
    // { githubUserName: messengerId }
    const reviewerObj: Record<string, string> = getReviewerObj();

    // { messengerId: { count: pendingReviewCount } }
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
