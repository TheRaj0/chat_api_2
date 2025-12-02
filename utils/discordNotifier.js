const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a message to Discord via webhook
 * @param {string} message - The text message to send
 */
async function sendDiscordMessage(message) {
    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message }),
        });

        if (res.ok) console.log("Discord message sent ✅");
        else console.log("Discord error:", await res.text());
    } catch (err) {
        console.error("Error sending Discord message:", err);
    }
}

module.exports = { sendDiscordMessage };
