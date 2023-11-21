declare type Assignee = {
    login: string;
};
declare type RequestedReviewer = {
    login: string;
};
export declare type Pull = {
    url: string;
    assignees: Assignee[];
    requested_reviewers: RequestedReviewer[];
    draft: boolean;
};
export declare type ReviewerForm = Record<string, {
    count: number;
}>;
export declare type Messenger = 'slack' | 'discord';
export {};
