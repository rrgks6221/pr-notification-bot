import axios, { AxiosResponse } from 'axios';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import { ReviwerForm, Pull } from './type';

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

export const getReviwers = (pulls: Pull[]): string[] => {
  const reviwers: string[] = pulls.reduce((acc: string[], cur) => {
    acc.push(
      ...cur.requested_reviewers.map((requested_reviewer) => {
        return requested_reviewer.login;
      }),
    );

    return acc;
  }, []);

  return reviwers;
};

export const getReviwerObj = (): Record<string, string> => {
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

export const getReviwerCount = (
  reviewers: string[],
  reviewerObj: Record<string, string>,
): ReviwerForm => {
  const obj: ReviwerForm = {};

  Object.entries(reviewerObj).forEach(
    ([githubUserName, discordId]: [string, string]) => {
      if (!reviewers.includes(githubUserName)) return;

      obj[discordId] = {
        githubUserName,
        count: reviewers.filter((reviewer) => {
          return reviewer === githubUserName;
        }).length,
      };
    },
  );

  return obj;
};

export const buildMessage = async (
  webhookUrl: string,
  reviwerForm: ReviwerForm,
) => {
  const hook = new Webhook(webhookUrl);

  const embed = new MessageBuilder()
    .setTitle(
      '리뷰 부탁드립니다. **https://github.com/pulls?q=is%3Aopen+is%3Apr+author%3Arrgks6221+archived%3Afalse+user%3Athe-pool**',
    )
    .setAuthor(
      'PR BOT',
      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      'https://github.com/pulls',
    )
    .setTimestamp();

  Object.entries(reviwerForm).forEach(
    ([discordId, { count, githubUserName }]: [
      string,
      { count: number; githubUserName: string },
    ]) => {
      const emoji: string = ':rage:'.repeat(count);

      embed.addField(githubUserName, `<@${discordId}>` + emoji);
    },
  );

  await hook.send(embed);
};
