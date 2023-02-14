type Assignee = {
  login: string;
};

type RequestedReviewer = {
  login: string;
};

export type Pull = {
  url: string;
  assignees: Assignee[];
  requested_reviewers: RequestedReviewer[];
  draft: boolean;
};

export type ReviwerForm = Record<string, { count: number }>;
