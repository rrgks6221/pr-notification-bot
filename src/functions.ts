import axios, { AxiosResponse } from 'axios';
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

export const getPendingPullRequests = (pulls: Pull[]): Pull[] => {
  return pulls.filter((pull) => {
    return !pull.draft && pull.requested_reviewers.length;
  });
};

export const getReviewers = (pulls: Pull[]): string[] => {
  return pulls.reduce((acc: string[], cur) => {
    const { requested_reviewers } = cur;
    acc.push(
      ...requested_reviewers.map((requestedReviewer) => {
        return requestedReviewer.login;
      }),
    );

    return acc;
  }, []);
};

export const getReviewerObj = (reviewer: string): Record<string, string> => {
  return reviewer
    .split(',')
    .reduce((acc: Record<string, string>, cur: string) => {
      const [githubUserName, messengerId]: string[] = cur.split(':');

      acc[githubUserName] = messengerId;

      return acc;
    }, {});
};

export const getReviewerForm = (
  reviewers: string[],
  reviewerObj: Record<string, string>,
): ReviewerForm => {
  const reviewerForm: ReviewerForm = {};

  Object.entries(reviewerObj).forEach(
    ([githubUserName, messengerId]: [string, string]) => {
      if (!reviewers.includes(githubUserName)) return;

      reviewerForm[messengerId] = {
        count: reviewers.filter((reviewer) => {
          return reviewer === githubUserName;
        }).length,
      };
    },
  );

  return reviewerForm;
};
