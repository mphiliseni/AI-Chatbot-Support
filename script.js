const chatMessagesDiv = document.getElementById('chat-messages');
const inputTextElement = document.getElementById('input-text');
const sendButton = document.getElementById('send-button');
let messages = [];
let isLoading = false;
const GEMINI_API_KEY = "YOUR_API_KEY"; //Add your Gemini API Key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;


function addMessageToChat(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', message.sender === 'user' ? 'justify-end' : 'justify-start');

    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('max-w-[75%]', 'p-3', 'rounded-lg');
    messageContentDiv.classList.add(message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-100');
    messageContentDiv.classList.add(message.sender === 'user' ? 'text-white' : 'text-gray-800');

    const messageText = document.createElement('p');
    messageText.classList.add('text-sm');
    messageText.textContent = message.text;

    messageContentDiv.appendChild(messageText);
    messageDiv.appendChild(messageContentDiv);
    chatMessagesDiv.appendChild(messageDiv);

    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; //Scroll to bottom
}

async function handleSendMessage() {
    const inputText = inputTextElement.value.trim();
    if (!inputText) return;

    const userMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: 'user',
    };

    messages.push(userMessage);
    addMessageToChat(userMessage);
    inputTextElement.value = '';
    setIsLoading(true);

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            contents: [{
            parts:[{
              text:inputText
            }]}]
        }),
      });


        if (!response.ok) {
          console.error("Gemini API Error:", response.statusText);
          throw new Error("Failed to fetch response from Gemini API");
        }

        const data = await response.json();
        const botResponseText = data.candidates[0].content.parts[0].text;


      const botMessage = {
            id: messages.length + 1,
            text: botResponseText,
            sender: 'bot',
      };
    messages.push(botMessage);
    addMessageToChat(botMessage);


    } catch (error) {
        const errorMessage = {
            id: messages.length + 1,
            text: 'Failed to fetch response. Please try again.',
            sender: 'bot',
        };
        messages.push(errorMessage);
        addMessageToChat(errorMessage);
    } finally {
        setIsLoading(false);
    }
}

function renderLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('flex', 'justify-start');
    const loadingTextDiv = document.createElement('div');
    loadingTextDiv.classList.add('bg-gray-100', 'p-3', 'rounded-lg');
    const loadingText = document.createElement('p');
    loadingText.classList.add('text-sm', 'text-gray-800');
    loadingText.textContent = 'Thinking...';
    loadingTextDiv.appendChild(loadingText);
    loadingDiv.appendChild(loadingTextDiv);
    chatMessagesDiv.appendChild(loadingDiv);
}

function setIsLoading(loading) {
    isLoading = loading;
    sendButton.disabled = loading;
    if (loading) {
        renderLoadingMessage();
    } else {
        const loadingMessage = chatMessagesDiv.lastElementChild;
        if (loadingMessage && loadingMessage.textContent === 'Thinking...') {
            loadingMessage.remove();
        }
    }
}

sendButton.addEventListener('click', handleSendMessage);
inputTextElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});