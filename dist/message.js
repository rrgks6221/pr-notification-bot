"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const webhook_1 = require("@slack/webhook");
const discord_webhook_node_1 = require("discord-webhook-node");
class Message {
    constructor(messenger, webhookUrl) {
        this.messenger = messenger;
        this.webhookUrl = webhookUrl;
        this.REVIEW_REQUESTED_URL = 'https://github.com/pulls/review-requested';
        this.sendSlackMessage = async (reviewerForm) => {
            const webHook = this.webHook;
            const dividerBlock = {
                type: 'divider',
            };
            const headerBlock = {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*리뷰부탁드립니다* :man-bowing: <${this.REVIEW_REQUESTED_URL}|리뷰하러가기>`,
                },
            };
            const reviewerBlocks = Object.entries(reviewerForm).map(([reviewerId, reviewerInfo]) => {
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
            });
            const blocks = {
                blocks: [headerBlock, dividerBlock, ...reviewerBlocks, dividerBlock],
            };
            await webHook.send(blocks);
        };
        if (this.messenger === 'discord') {
            this.webHook = new discord_webhook_node_1.Webhook(this.webhookUrl);
        }
        if (this.messenger === 'slack') {
            this.webHook = new webhook_1.IncomingWebhook(this.webhookUrl);
        }
    }
    async send(reviewerForm) {
        if (this.messenger === 'discord') {
            await this.sendDiscordMessage(reviewerForm);
        }
        if (this.messenger === 'slack') {
            await this.sendSlackMessage(reviewerForm);
        }
    }
    async sendDiscordMessage(reviewerForm) {
        const webHook = this.webHook;
        const THUMBNAIL_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRidSZL4BdECVb3sL0ZQ2jZSYIWNDQTiTcJJQ&usqp=CAU';
        const FOOTER_IMAGE_URL = 'https://avatars.githubusercontent.com/u/113972423?s=200&v=4';
        const FOOTER_DESCRIPTION = 'user Description';
        webHook.setAvatar('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
        webHook.setUsername('Git Hub');
        const embed = new discord_webhook_node_1.MessageBuilder()
            .setColor('#00b0f4')
            .setAuthor('PR BOT', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', this.REVIEW_REQUESTED_URL)
            .setTitle('리뷰 부탁드립니다.')
            .setDescription(`**[리뷰하러 가기](${this.REVIEW_REQUESTED_URL})**`)
            .setThumbnail(THUMBNAIL_URL)
            .setFooter(FOOTER_DESCRIPTION, FOOTER_IMAGE_URL)
            .setTimestamp();
        Object.entries(reviewerForm).forEach(([discordId, { count }]) => {
            const emoji = ':fire:'.repeat(count);
            embed.addField('', `<@${discordId}> ` + emoji, true);
            embed.addField('', `**${count}건**`, true);
            embed.addField('', '', true);
        });
        embed.addField('', '\n');
        await webHook.send(embed);
    }
}
exports.Message = Message;
//# sourceMappingURL=message.js.map