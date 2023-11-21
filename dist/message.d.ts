import { Messenger, ReviewerForm } from './type';
export declare class Message {
    private readonly messenger;
    private readonly webhookUrl;
    private readonly webHook;
    private readonly REVIEW_REQUESTED_URL;
    constructor(messenger: Messenger, webhookUrl: string);
    send(reviewerForm: ReviewerForm): Promise<void>;
    private sendDiscordMessage;
    private sendSlackMessage;
}
