# Github Pull Request Reminder Bot

## PR 알림을 위한 Bot 입니다.

> ### `./.github/workflows/sendPrRemind.yml` 의 cron 식에 따라 리뷰해야할 PR 을 Remind 해줍니다.

<br/>

## 지원되는 Messenger Tool

- **Discord**
- **Slack**

<br/>

<img width="675" alt="image" src="https://github.com/rrgks6221/pr-notification-bot/assets/46591459/ea26d9e8-8795-4141-bb64-9044eaa47ded">

<br/>

## How To Use Custom

> 1. git clone https://github.com/rrgks6221/pr-notification-bot.git
> 2. .env.sample 파일과 같은 형식으로 .env 를 만든 뒤 값을 채워주세요.
> 3. message format customizing
>
>    - discord, slack 사용 시 [message](./src/message.ts) 의 각 메서드를 수정해주세요.
>    - 다른 Messenger 를 사용한다면 해당 webhook interface 에 맞게 [functions](./src/message.ts) 의 새로운 메서드를 추가해주세요
>
> 4. npm i
> 5. npm run start 를 통해 채널에 메시지가 잘 오는지 확인해주세요.
> 6. ./.github/workflows/sendPrRemind.yml 을 custom 해주세요.
> 7. github action 상 추가 방법
>    1. 본인 repository
>    2. Settings
>    3. Secret and variables - actions
>    4. 사진처럼 값을 채워주세요.<img width="766" alt="image" src="https://user-images.githubusercontent.com/46591459/236629544-b1054a4d-c7e0-4693-8612-bc4e0f95d2f0.png">

<br/>

## **Contributors**

- [**SeokHo Lee**](https:github.com/rrgks6221) - <rrgks@naver.com>

<br/>

## **License**

### Git Hub Pull Request Reminder Bot is [MIT licensed](LICENSE).
