import { getInput } from '@actions/core';
import * as dotenv from 'dotenv';
import {
  getPendingPullRequests,
  getPullRequestsFromRepos,
  getReviewerForm,
  getReviewerObj,
  getReviewers,
} from './functions';
import { Message } from './message';
import { Messenger, Pull, ReviewerForm } from './type';

dotenv.config();

// 토큰을 주지 않을경우 rate limit 에 걸려 알림이 오지 않을수도 있습니다.
const { GITHUB_TOKEN } = process.env;

async function main() {
  try {
    // messenger type
    const messengerType = getInput('MESSENGER_TYPE', {
      required: false,
    }) as Messenger;
    // github owner
    // https://github.com/rrgks6221/pr-notification-bot => rrgks6221
    const owner = getInput('OWNER', {
      required: true,
    });
    // collect pr repositories
    const repos = getInput('REPOS', {
      required: true,
    }).split(',');
    // messenger webhook url
    const webhookUrl = getInput('WEBHOOK_URL', {
      required: true,
    });

    // ex) githubNickname1:webhookId1,githubNickname2:webhookId2
    const githubMessengerMap = getInput('MESSENGER_GITHUB_MAP', {
      required: true,
    });

    console.info(`messenger type is ${messengerType}`);
    console.info(`owner is ${owner}`);
    console.info(`repos is ${repos}`);
    console.info(`githubMessengerMap is ${githubMessengerMap}`);

    // all pull requests
    const pulls: Pull[] = await getPullRequestsFromRepos(
      owner,
      repos,
      GITHUB_TOKEN,
    );

    console.log(pulls);

    // pending status pull requests
    const pendingPulls: Pull[] = getPendingPullRequests(pulls);

    // github userName
    const reviewers: string[] = getReviewers(pendingPulls);
    // { githubUserName: messengerId }
    const reviewerObj: Record<string, string> =
      getReviewerObj(githubMessengerMap);

    // { messengerId: { count: pendingReviewCount } }
    const reviewerForm: ReviewerForm = getReviewerForm(reviewers, reviewerObj);

    const message = new Message(messengerType, webhookUrl);

    await message.send(reviewerForm);

    console.log(reviewerForm);
  } catch (error) {
    console.error(error);
  }
}

main();
