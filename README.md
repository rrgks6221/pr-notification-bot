# 🔔 PR Notification Bot

[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Action-Marketplace-blue?logo=github)](https://github.com/marketplace/actions/pr-notification-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

팀원들이 리뷰하지 않은 PR을 Slack 또는 Discord로 리마인드합니다.  
협업 효율을 높이고 PR 병목을 줄이세요.

---

## 🚀 사용 예시

`.github/workflows/pr-reminder.yml`

```yaml
name: PR Reminder

on:
  schedule:
    - cron: '0 10 * * 1-5' # 평일 오전 10시에 실행
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: your-org/pr-notification-bot@v1
        with:
          OWNER: rrgks6221
          REPOS: pr-notification-bot,teamup-backend
          WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          MESSENGER_GITHUB_MAP: rrgks6221:U12345678,alice:U87654321
          MESSENGER_TYPE: slack
```

## ⚙️ 입력값 (inputs)

| 이름                   | 필수 | 설명                                                                     | 예시                          |
| ---------------------- | ---- | ------------------------------------------------------------------------ | ----------------------------- |
| `OWNER`                | ✅   | GitHub 조직 또는 개인 사용자명                                           | `rrgks6221`                   |
| `REPOS`                | ✅   | 콤마(,)로 구분된 대상 repository 이름 목록                               | `repo1,repo2,repo3`           |
| `WEBHOOK_URL`          | ✅   | Slack 또는 Discord의 Webhook URL                                         | `https://hooks.slack.com/...` |
| `MESSENGER_GITHUB_MAP` | ✅   | GitHub 닉네임과 메신저 사용자 ID 간 매핑 (`닉네임:ID` 형태, 콤마로 구분) | `rrgks6221:U1234,alice:U5678` |
| `MESSENGER_TYPE`       | ❌   | 메시지를 보낼 메신저 종류 (`slack` 또는 `discord`) / 기본값: `slack`     | `slack` 또는 `discord`        |

<br/>

## 메시지 예시

<img width="675" alt="image" src="https://github.com/rrgks6221/pr-notification-bot/assets/46591459/ea26d9e8-8795-4141-bb64-9044eaa47ded">

<br/>

## **Contributors**

- [**SeokHo Lee**](https:github.com/rrgks6221) - <rrgks@naver.com>

<br/>

## **License**

### Git Hub Pull Request Reminder Bot is [MIT licensed](LICENSE)
