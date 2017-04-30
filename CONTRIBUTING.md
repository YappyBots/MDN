# Contributing to MDN

### Clone repo

```sh
$ cd folder/where/i/want/bot
$ git clone https://github.com/datitisev/DiscordBot-MDN.git
```

### Linting

Please use an ESLint plugin for your editor, and use the current configuration (located in `.eslintrc`).

### Starting the bot

Yappy GitLab needs the following environment variables:

- **REQUIRED** `MDN_DISCORD_TOKEN` - discord bot token
- **OPTIONAL** `TRACE_API_KEY` - trace API key for mem leak detection :)

MDN also needs to be run with NodeJS v7 and the `--harmony` flag.
An example on running the bot:

```sh
$ MDN_DISCORD_TOKEN=mfa-l0l node --harmony index.js
```