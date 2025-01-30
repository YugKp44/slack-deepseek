const express = require('express');
const { WebClient } = require('@slack/web-api');
const { getSlackToken, fetchConversations, sendMessage } = require('./slackAuth');
require('dotenv').config();
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
// Slack OAuth Redirect URL
app.get('/auth/slack', (req, res) => {
  const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=channels:read,chat:write,im:read,im:write&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;
  res.redirect(url);
});

// Slack OAuth Callback
app.get('/auth/slack/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const token = await getSlackToken(code); // This will return the User Token
    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (error) {
    res.status(500).send('Error during OAuth');
  }
});

// Get Channels and DMs
app.get('/api/conversations', async (req, res) => {
  const token = req.query.token;
  try {
    const conversations = await fetchConversations(token);
    res.json(conversations);
  } catch (error) {
    res.status(500).send('Error fetching conversations');
  }
});
app.get('/api/messages', async (req, res) => {
  const token = req.query.token;
  const channel = req.query.channel;
  const slackClient = new WebClient(token);

  try {
    // Fetch messages using the Slack API
    const result = await slackClient.conversations.history({
      channel: channel,
      limit: 100, // Fetch up to 100 messages
    });

    // Format messages for the frontend
    const messages = result.messages.map((message) => ({
      user: message.user,
      text: message.text,
      ts: message.ts, // Timestamp of the message
    }));

    res.json(messages);
      } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).send('Error fetching messages');
  }
});

// Send Message
app.post('/api/send-message', async (req, res) => {
  const { token, channel, text } = req.body;
  try {
    const result = await sendMessage(token, channel, text);
    res.json(result);
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});
// Send Message
app.post('/api/send-message', async (req, res) => {
  const { token, channel, text } = req.body;
  try {
    const result = await sendMessage(token, channel, text);
    res.json(result);
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});