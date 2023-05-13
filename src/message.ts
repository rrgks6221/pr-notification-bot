import { DividerBlock, SectionBlock } from '@slack/types';
import {
  IncomingWebhook as SlackWebHook,
  IncomingWebhookSendArguments,
} from '@slack/webhook';
import {
  MessageBuilder,
  Webhook as DiscordWebHook,
} from 'discord-webhook-node';
import { Messenger, ReviewerForm } from './type';

export class Message {
  private readonly webHook: DiscordWebHook | SlackWebHook;
  private readonly REVIEW_REQUESTED_URL =
    'https://github.com/pulls/review-requested';

  constructor(
    private readonly messenger: Messenger,
    private readonly webhookUrl: string,
  ) {
    if (this.messenger === 'discord') {
      this.webHook = new DiscordWebHook(this.webhookUrl);
    }
    if (this.messenger === 'slack') {
      this.webHook = new SlackWebHook(this.webhookUrl);
    }
  }

  async send(reviewerForm: ReviewerForm): Promise<void> {
    if (this.messenger === 'discord') {
      await this.sendDiscordMessage(reviewerForm);
    }
    if (this.messenger === 'slack') {
      await this.sendSlackMessage(reviewerForm);
    }
  }

  private async sendDiscordMessage(reviewerForm: ReviewerForm): Promise<void> {
    const webHook = this.webHook as DiscordWebHook;

    const THUMBNAIL_URL =
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRidSZL4BdECVb3sL0ZQ2jZSYIWNDQTiTcJJQ&usqp=CAU';
    // message footer image url
    const FOOTER_IMAGE_URL =
      'https://avatars.githubusercontent.com/u/113972423?s=200&v=4';
    // message footer description
    const FOOTER_DESCRIPTION = 'user Description';

    webHook.setAvatar(
      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    );
    webHook.setUsername('Git Hub');

    const embed = new MessageBuilder()
      .setColor('#00b0f4' as unknown as number)
      .setAuthor(
        'PR BOT',
        'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        this.REVIEW_REQUESTED_URL,
      )
      .setTitle('리뷰 부탁드립니다.')
      .setDescription(`**[리뷰하러 가기](${this.REVIEW_REQUESTED_URL})**`)
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
  }

  private sendSlackMessage = async (
    reviewerForm: ReviewerForm,
  ): Promise<void> => {
    const webHook = this.webHook as SlackWebHook;

    const dividerBlock: DividerBlock = {
      type: 'divider',
    };

    const headerBlock: SectionBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*리뷰부탁드립니다* :man-bowing: <${this.REVIEW_REQUESTED_URL}|리뷰하러가기>`,
      },
    };

    const reviewerBlocks: SectionBlock[] = Object.entries(reviewerForm).map(
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

    const blocks: IncomingWebhookSendArguments = {
      blocks: [headerBlock, dividerBlock, ...reviewerBlocks, dividerBlock],
    };

    await webHook.send(blocks);
  };
}
