function conversationContext(input = {}) {
  const summary = input.conversationSummary || input.currentConversation || "";
  return {
    key: "conversation",
    label: "Conversation",
    score: summary ? 100 : 68,
    missing: summary ? [] : ["conversationSummary"],
    data: { summary: summary || null, messages: Array.isArray(input.messages) ? input.messages.slice(-10) : [] }
  };
}

module.exports = { conversationContext };
