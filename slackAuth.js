const axios = require('axios');
const { WebClient } = require('@slack/web-api');
require('dotenv').config();

// Function to get Slack OAuth access token (User Token)
const getSlackToken = async (code) => {
  try {
    const response = await axios.get('https://slack.com/api/oauth.v2.access', {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
    });
    return response.data.authed_user.access_token; // User Token
  } catch (error) {
    throw new Error('Error during OAuth');
  }
};

// Function to fetch conversations (channels and DMs)
const fetchConversations = async (token) => {
  const slack = new WebClient(token);
  try {
    const result = await slack.conversations.list({ types: 'public_channel,im' });
    return result.channels;
  } catch (error) {
    throw new Error('Error fetching conversations');
  }
};

// Function to send a message
const sendMessage = async (token, channel, text) => {
  const slack = new WebClient(token);
  try {
    const result = await slack.chat.postMessage({ channel, text });
    return result;
  } catch (error) {
    throw new Error('Error sending message');
  }
};

module.exports = { getSlackToken, fetchConversations, sendMessage };