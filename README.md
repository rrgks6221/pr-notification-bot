# Github Pull Request Reminder Bot

### [The Pool Team](https://github.com/the-pool) 의 PR 알림을 위한 Bot 입니다.

### 매일 오전 10시, 오후 8시 2번씩 리뷰어로 리뷰해야할 PR 을 Remind 해줍니다.

<img width="378" alt="image" src="https://user-images.githubusercontent.com/46591459/236627823-768a2d51-6bff-4971-a073-cc9f69455611.png">

<br/>

## How To Use Custom

---

- .env.sample 파일과 같은 형식으로 .env 를 만든 뒤 값을 채워주세요.
- discord 를 사용 시 [functions](./src/functions.ts) sendMessage 의 값만 바꾸면 됩니다.
- 다른 app 을 사용한다면 해당 webhook interface 에 맞게 sendMessage 를 수정해야합니다.
- /.github/workflows/sendPrRemind.yml 을 custom 해주세요.
- github action 상 추가 방법
  1. 본인 repository
  2. Settings
  3. Secret and variables - actions
  4. 사진처럼 값을 채워주세요.<img width="766" alt="image" src="https://user-images.githubusercontent.com/46591459/236629544-b1054a4d-c7e0-4693-8612-bc4e0f95d2f0.png">

## **Related projects**

- [the-pool-api](https://github.com/the-pool/the-pool-api)

## **Contributors**

---

- [**SeokHo Lee**](https:github.com/rrgks6221) - <rrgks@naver.com>

<br/>

## **License**

---

### Git Hub Pull Request Reminder Bot is [MIT licensed](LICENSE).
