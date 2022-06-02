import { createBot, startBot } from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts"
import { enableCachePlugin, enableCacheSweepers } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts"
import { sendDirectMessage } from "https://deno.land/x/discordeno_helpers_plugin@0.0.8/mod.ts"

let messageId = BigInt(0)

const baseBot = createBot({
  token: Deno.env.get("DISCORD_TOKEN")!,
  intents: ["Guilds", "GuildMessages", "GuildMessageReactions"],
  botId: BigInt(Deno.env.get("BOT_ID")!),
  events: {
    ready() {
      console.log("Successfully connected to gateway")
    },
    messageCreate(bot, message) {
      if(message.content.startsWith("!ping")) {
        bot.helpers.sendMessage(message.channelId, { content: "pong!" })
      }

      // 特定の単語が送信されたチャンネルにメッセージを送信する
      if(message.content.includes("こんにちは")) {
        bot.helpers.sendMessage(message.channelId, { content: "やっほ〜" })
      }
      // メンションされたらリアクションを追加する
      if(message.mentionedUserIds.includes(bot.id)) {
        bot.helpers.addReaction(message.channelId, message.id, "🤧")
      }
      // ダイレクトメッセージの送信
      if(message.content.includes("はろ")) {
        sendDirectMessage(bot, message.authorId, "DMだよ〜")
      }

      if(message.content.startsWith("!help")) {
        (async() => {
          const result = await bot.helpers.sendMessage(message.channelId, { content: "これはヘルプです\n詳細はチェックマークをクリックしてください" })
          bot.helpers.addReaction(result.channelId, result.id, "✅")
          messageId = result.id
        })()
      }
    },
    reactionAdd(bot, payload) {
      if(payload.userId == bot.id) return

      bot.helpers.sendMessage(payload.channelId, { content: payload.emoji.name })
      if(payload.messageId == messageId && payload.emoji.name == "✅") {
        sendDirectMessage(bot, payload.userId, "これはヘルプの詳細です")
      }
    }
  }
})

const bot = enableCachePlugin(baseBot)
enableCacheSweepers(bot)

await startBot(bot)