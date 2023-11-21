import { ReviewerForm, Pull } from './type';
export declare const getPullRequestsFromRepos: (owner: string, repos: string[], token?: string) => Promise<Pull[]>;
export declare const getPendingPullRequests: (pulls: Pull[]) => Pull[];
export declare const getReviewers: (pulls: Pull[]) => string[];
export declare const getReviewerObj: (reviewer: string) => Record<string, string>;
export declare const getReviewerForm: (reviewers: string[], reviewerObj: Record<string, string>) => ReviewerForm;
