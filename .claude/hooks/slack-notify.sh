#!/bin/bash
# Claude Code 훅 → Slack 웹훅 알림 (권한 요청 / 작업 완료)
#
# 입력: stdin으로 훅 이벤트 JSON (Notification, Stop)
# 설정값 (프로젝트 루트의 .env 또는 환경변수에서 읽는다. 환경변수가 우선):
#   SLACK_WEBHOOK_URL (필수) Slack Incoming Webhook URL
#   SLACK_MENTION     (선택) 멘션 문자열. 예: <@U123ABC> (모바일 푸시를 확실히 울리고 싶을 때)
#
# 알림은 부가 기능이므로 어떤 경우에도 Claude Code 동작을 막지 않도록 항상 exit 0 한다.

command -v jq >/dev/null 2>&1 || exit 0

# .env에서 키 하나만 읽는다. source는 .env 안의 코드를 실행하므로 쓰지 않는다.
env_file="${CLAUDE_PROJECT_DIR:-$PWD}/.env"
read_env() {
  [ -f "$env_file" ] || return 0
  local value
  value=$(sed -n -E "s/^(export )?$1=//p" "$env_file" | tail -n 1 | tr -d '\r')
  value=${value#\"}; value=${value%\"}; value=${value#\'}; value=${value%\'}
  printf '%s' "$value"
}

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-$(read_env SLACK_WEBHOOK_URL)}"
SLACK_MENTION="${SLACK_MENTION:-$(read_env SLACK_MENTION)}"

# 웹훅 URL이 없으면 조용히 종료
[ -z "$SLACK_WEBHOOK_URL" ] && exit 0

input=$(cat)

# 프로젝트명은 작업 디렉터리의 마지막 폴더명
project=$(basename "$(jq -r '.cwd // empty' <<<"$input")")
[ -z "$project" ] && project="unknown"

# 알림 시각은 로컬 시간대 기준 (jq의 strftime은 UTC라서 쉘 date를 쓴다)
time=$(date '+%Y-%m-%d %H:%M:%S')

# 이벤트별 메시지 생성 (Slack mrkdwn 특수문자 & < > 는 이스케이프)
# 제목 줄 아래에 프로젝트/상태/시간 필드를 넣고, 그 다음 줄에 본문을 붙인다.
text=$(jq -r --arg project "$project" --arg time "$time" '
  def esc: gsub("&"; "&amp;") | gsub("<"; "&lt;") | gsub(">"; "&gt;");
  def cut($n): if length > $n then .[0:$n] + "…" else . end;
  def fields($p; $status): "*프로젝트:* \($p)\n*상태:* \($status)\n*시간:* \($time)";
  ($project | esc) as $p
  | if .hook_event_name == "Notification" then
      "🔐 *[\($p)] 권한 요청*\n\(fields($p; "권한 요청"))\n\((.message // "Claude가 권한을 기다리고 있습니다") | cut(200) | esc)"
    elif .hook_event_name == "Stop" then
      "✅ *[\($p)] 작업 완료*\n\(fields($p; "작업 완료"))\n\((.last_assistant_message // "") | cut(200) | esc)"
    else empty end
' <<<"$input" 2>/dev/null)

# 처리 대상 이벤트가 아니면 종료
[ -z "$text" ] && exit 0

# 멘션이 있으면 메시지 앞에 붙임
[ -n "${SLACK_MENTION:-}" ] && text="${SLACK_MENTION} ${text}"

# 페이로드는 jq로 만들어 따옴표·줄바꿈이 깨지지 않게 전송
jq -n --arg text "$text" '{text: $text}' \
  | curl -s -m 5 -o /dev/null -X POST \
      -H 'Content-Type: application/json' \
      --data @- "$SLACK_WEBHOOK_URL" || true

exit 0
