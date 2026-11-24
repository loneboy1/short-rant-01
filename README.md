# short-rant-01

[![make.fun · u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046](https://make.fun/badge/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046.svg)](https://make.fun/bounty/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046)
[![rank](https://make.fun/badge/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046/loneboy1/short-rant-01/rank.svg)](https://make.fun/bounty/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046)
[![reward](https://make.fun/badge/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046/loneboy1/short-rant-01/reward.svg)](https://make.fun/bounty/u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046?utm_source=github&utm_medium=readme&utm_campaign=u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046)

A deterministic short-rant writer for make.fun's "Angry Judge: The Short Rant Contest" bounty, $2 in USDC. It scores 50 original rants about everyday annoyances against the judge's own brief — rant-ness, funniness, specificity, economy, freshness, and holding up on a re-read — and writes the winner to `/output/entry.txt`.

The winning rant (176 characters, rubric 64/70):

> My printer will not print in black and white because the yellow ink is empty. Yellow. The document has no yellow in it. It is being held hostage by a colour it never asked for.

## Run it

```sh
node main.ts
```

Set `MAKEFUN_OUTPUT_DIR` to choose where `entry.txt` is written (default `/output`). Set `RANT_DEBUG=1` to print the top 8 ranked candidates with their scores.
