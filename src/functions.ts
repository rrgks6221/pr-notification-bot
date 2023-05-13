import axios, { AxiosResponse } from 'axios';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import { IncomingWebhook } from '@slack/webhook';
import { ReviewerForm, Pull, Messenger } from './type';

const REVIEW_REQUESTED_URL = 'https://github.com/pulls/review-requested';

export const getPullRequestsFromRepos = async (
  owner: string,
  repos: string[],
  token?: string,
): Promise<Pull[]> => {
  const headers = token ? { Authorization: `token ${token}` } : undefined;
  const promisesResponse: Promise<AxiosResponse<Pull[]>>[] = repos.map(
    (repo) => {
      return axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers,
      });
    },
  );

  const responses: AxiosResponse<Pull[]>[] = await Promise.all(
    promisesResponse,
  );

  const pulls: Pull[] = responses.reduce((acc: Pull[], response) => {
    const { data: datas } = response;

    acc.push(
      ...datas.map((data) => {
        const { url, assignees, requested_reviewers, draft } = data;

        return {
          url,
          assignees,
          requested_reviewers,
          draft,
        };
      }),
    );

    return acc;
  }, []);

  return pulls;
};

export const getReviewers = (pulls: Pull[]): string[] => {
  const reviewers: string[] = pulls.reduce((acc: string[], cur) => {
    acc.push(
      ...cur.requested_reviewers.map((requested_reviewer) => {
        return requested_reviewer.login;
      }),
    );

    return acc;
  }, []);

  return reviewers;
};

export const getReviewerObj = (): Record<string, string> => {
  // ex) githubNickname1:webhookId1,githubNickname2:webhookId2
  const REVIEWER = process.env.REVIEWER as string;

  return REVIEWER.split(',').reduce(
    (acc: Record<string, string>, cur: string) => {
      const [githubUserName, messengerId]: string[] = cur.split(':');

      acc[githubUserName] = messengerId;

      return acc;
    },
    {},
  );
};

export const getReviewerCount = (
  reviewers: string[],
  reviewerObj: Record<string, string>,
): ReviewerForm => {
  const obj: ReviewerForm = {};

  Object.entries(reviewerObj).forEach(
    ([githubUserName, messengerId]: [string, string]) => {
      if (!reviewers.includes(githubUserName)) return;

      obj[messengerId] = {
        count: reviewers.filter((reviewer) => {
          return reviewer === githubUserName;
        }).length,
      };
    },
  );

  return obj;
};

const sendDiscordMessage = async (
  webhookUrl: string,
  reviewerForm: ReviewerForm,
): Promise<void> => {
  // message thumbnail image url
  const THUMBNAIL_URL =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRidSZL4BdECVb3sL0ZQ2jZSYIWNDQTiTcJJQ&usqp=CAU';
  // message footer image url
  const FOOTER_IMAGE_URL =
    'https://avatars.githubusercontent.com/u/113972423?s=200&v=4';
  // message footer description
  const FOOTER_DESCRIPTION = 'user Description';

  const webHook = new Webhook(webhookUrl);

  webHook.setAvatar(
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  );
  webHook.setUsername('Git Hub');

  const embed = new MessageBuilder()
    .setColor('#00b0f4' as unknown as number)
    .setAuthor(
      'PR BOT',
      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      REVIEW_REQUESTED_URL,
    )
    .setTitle('리뷰 부탁드립니다.')
    .setDescription(`**[리뷰하러 가기](${REVIEW_REQUESTED_URL})**`)
    .setThumbnail(THUMBNAIL_URL)
    .setFooter(FOOTER_DESCRIPTION, FOOTER_IMAGE_URL)
    .setTimestamp();

  Object.entries(reviewerForm).forEach(
    ([discordId, { count }]: [string, { count: number }]) => {
      const emoji: string = ':fire:'.repeat(count);

      embed.addField('', `<@${discordId}> ` + emoji, true);
      embed.addField('', `**${count}건**`, true);
      embed.addField('', '', true);
    },
  );

  embed.addField('', '\n');

  await webHook.send(embed);
};

const sendSlackMessage = async (
  webhookUrl: string,
  reviewerForm: ReviewerForm,
): Promise<void> => {
  const webHook = new IncomingWebhook(webhookUrl);

  const dividerBlock = {
    type: 'divider',
  };

  const headerBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*리뷰부탁드립니다* :man-bowing: <${REVIEW_REQUESTED_URL}|리뷰하러가기>`,
    },
  };

  const reviewerBlocks = Object.entries(reviewerForm).map(
    ([reviewerId, reviewerInfo]) => {
      const { count } = reviewerInfo;
      const fireEmoji = Array(count).fill(':fire:').join('');

      return {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<@${reviewerId}>*\n${fireEmoji}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: `${count}건`,
          },
        },
      };
    },
  );

  const blocks = {
    blocks: [headerBlock, dividerBlock, ...reviewerBlocks, dividerBlock],
  };

  await webHook.send(blocks);
};

export const sendMessage = async (
  messenger: Messenger,
  webhookUrl: string,
  reviewerForm: ReviewerForm,
): Promise<void> => {
  if (messenger === 'discord') {
    return sendDiscordMessage(webhookUrl, reviewerForm);
  }
  if (messenger === 'slack') {
    return sendSlackMessage(webhookUrl, reviewerForm);
  }
};
