import {
  sendMessage,
  getPullRequestsFromRepos,
  getReviewerObj,
  getReviewers,
  getReviewerForm,
  getPendingPullRequests,
} from './functions';
import * as dotenv from 'dotenv';
import { Pull, ReviewerForm } from './type';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL as string;

// 토큰을 주지 않을경우 rate limit 에 걸려 알림이 오지 않을수도 있습니다.
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;

// ex) githubNickname1:webhookId1,githubNickname2:webhookId2
const REVIEWER = process.env.REVIEWER as string;

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

    // pending status pull requests
    const pendingPulls: Pull[] = getPendingPullRequests(pulls);

    // github userName
    const reviewers: string[] = getReviewers(pendingPulls);
    // { githubUserName: messengerId }
    const reviewerObj: Record<string, string> = getReviewerObj(REVIEWER);

    // { messengerId: { count: pendingReviewCount } }
    const reviewerForm: ReviewerForm = getReviewerForm(reviewers, reviewerObj);

    await sendMessage('slack', WEBHOOK_URL, reviewerForm);

    console.log(reviewerForm);
  } catch (error) {
    console.error(error);
  }
}

main();
