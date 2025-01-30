const axios = require('axios');
const { WebClient } = require('@slack/web-api');
require('dotenv').config();

// Function to get Slack OAuth access token (User Token)
const getSlackToken = async (code) => {
  try {
    console.log("Starting OAuth process with code:", code);
    
    const response = await axios.get('https://slack.com/api/oauth.v2.access', {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
    });
    
    console.log("OAuth response received:", response.data);
    
    if (!response.data.ok) {
      console.error("Slack OAuth error:", response.data.error);
      throw new Error(`OAuth failed: ${response.data.error}`);
    }
    
    if (!response.data.authed_user || !response.data.authed_user.access_token) {
      console.error("Access token missing in response:", response.data);
      throw new Error("OAuth successful, but access token is missing");
    }
    
    console.log("Access token received successfully");
    return response.data.authed_user.access_token; // User Token
  } catch (error) {
    console.error("Error during OAuth:", error.message || error);
    throw new Error('Error during OAuth process');
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