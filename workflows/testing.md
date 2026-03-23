# Testing Workflow — Automated QA

## Trigger
User nói: "test [ticket]", "QA [ticket]", "chạy test", "run test", "chạy test tính năng [X]", "test task [X]"

## Input Required
- `ticket_key` (e.g. SB-8523) HOẶC `feature_name` (bắt buộc)
- `app_code`: OL / CB / AC / AV / SFF (hỏi nếu chưa rõ)

## Flow Overview

```
Phase 1: Read PRD + Codebase → Generate Test Cases → Chia 3 phần
Phase 2a: Setup browser + app state (tuần tự, 1 lần)
Phase 2b: 3 QA Agents verify song song (mỗi agent 1 storefront tab)
Phase 3: Merge results → Report
```

## Step 1: Generate + Split Test Cases — QA Agent

**Agent**: `qa-agent` | **Skill**: `/qa-test`

1. Đọc PRD + codebase → generate test cases
2. Chia 3 phần (complete groups, đều cases)
3. Output: tracker HTML + markdown archive + split mapping

### --- CHECKPOINT: User review test cases ---

## Step 2a: Setup Browser + App State (Tuần tự)

1 agent setup Chrome debug + app state + 3 storefront tabs.
KHÔNG bringToFront() — Puppeteer CDP only.

## Step 2b: Parallel Verify — 3 QA Agents

3 agents `run_in_background: true`, mỗi agent 1 storefront tab, read-only verify.

## Step 3: Merge + Report

Export tracker state → tổng hợp report → suggest Jira comment.
