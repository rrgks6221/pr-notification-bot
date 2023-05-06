import axios, { AxiosResponse } from 'axios';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import { ReviewerForm, Pull } from './type';

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
      const [githubUserName, discordId]: string[] = cur.split(':');

      acc[githubUserName] = discordId;

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
    ([githubUserName, discordId]: [string, string]) => {
      if (!reviewers.includes(githubUserName)) return;

      obj[discordId] = {
        count: reviewers.filter((reviewer) => {
          return reviewer === githubUserName;
        }).length,
      };
    },
  );

  return obj;
};

export const sendMessage = async (
  webhookUrl: string,
  reviewerForm: ReviewerForm,
): Promise<void> => {
  const hook = new Webhook(webhookUrl);

  hook.setAvatar(
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  );
  hook.setUsername('Git Hub');

  const embed = new MessageBuilder()
    .setColor('#00b0f4' as unknown as number)
    .setAuthor(
      'PR BOT',
      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      'https://github.com/pulls',
    )
    .setTitle('리뷰 부탁드립니다.')
    .setDescription('**[리뷰하러 가기](https://github.com/pulls)**')
    .setThumbnail(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRidSZL4BdECVb3sL0ZQ2jZSYIWNDQTiTcJJQ&usqp=CAU',
    )
    .setFooter(
      'the-pool',
      'https://avatars.githubusercontent.com/u/113972423?s=200&v=4',
    )
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

  await hook.send(embed);
};
