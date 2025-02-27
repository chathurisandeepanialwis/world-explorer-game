// Constants
const API_KEY = 'AIzaSyCLVEXm2lN8T6GPB6qg3i2E7AOe6eEHK-M'; // Replace with your actual API key
const KG_SEARCH_ENDPOINT = 'https://kgsearch.googleapis.com/v1/entities:search';

// DOM Elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Event Listeners
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

// Initialize common travel topics for the chatbot to recognize
const travelTopics = {
    capital: ['capital', 'capitals', 'main city'],
    monuments: ['monument', 'monuments', 'landmark', 'landmarks', 'attraction', 'attractions', 'place to see', 'places to see', 'famous places'],
    languages: ['language', 'languages', 'speak', 'spoken', 'talk'],
    facts: ['fact', 'facts', 'interesting', 'unique', 'cool things', 'tell me about'],
    travel: ['travel', 'visit', 'go to', 'traveling to', 'visiting']
};

// Main function to handle user input
function handleUserInput() {
    const userMessage = userInput.value.trim();
    
    if (userMessage === '') return;
    
    // Display user message
    addMessage(userMessage, 'user');
    
    // Clear input field
    userInput.value = '';
    
    // Show loading animation
    showLoading();
    
    // Process user query
    processUserQuery(userMessage);
}

// Function to programmatically ask a question (for suggestion chips)
function askQuestion(question) {
    userInput.value = question;
    handleUserInput();
}

// Add message to chat box
function addMessage(message, sender, suggestions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('d-flex', 'mb-3');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('rounded-pill', 'px-3', 'py-2');
    
    if (sender === 'user') {
        messageDiv.classList.add('justify-content-end');
        messageContent.classList.add('user-message');
    } else {
        messageContent.classList.add('bot-message');
    }
    
    messageContent.innerHTML = `<p class="mb-2">${message}</p>`;
    
    // Add suggestions if provided
    if (suggestions.length > 0 && sender === 'bot') {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.classList.add('d-flex', 'flex-wrap');
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2', 'mb-2');
            chip.textContent = suggestion.text;
            chip.onclick = () => askQuestion(suggestion.query);
            suggestionsDiv.appendChild(chip);
        });
        
        messageContent.appendChild(suggestionsDiv);
    }
    
    messageDiv.appendChild(messageContent);
    chatBox.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Show loading animation
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('d-flex', 'mb-3', 'loading-message');
    
    const loadingContent = document.createElement('div');
    loadingContent.classList.add('rounded-pill', 'px-3', 'py-2', 'bot-message');
    
    const loadingDots = document.createElement('div');
    loadingDots.classList.add('loading-dots');
    loadingDots.innerHTML = `
        <div></div>
        <div></div>
        <div></div>
    `;
    
    loadingContent.appendChild(loadingDots);
    loadingDiv.appendChild(loadingContent);
    chatBox.appendChild(loadingDiv);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove loading animation
function removeLoading() {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Process user query
async function processUserQuery(query) {
    // Analyze what the user is asking about
    const location = extractLocation(query);
    const topic = identifyTopic(query);
    
    if (!location) {
        // If no location is found, ask for clarification
        removeLoading();
        const suggestions = [
            {text: "France", query: "Tell me about France"},
            {text: "Egypt", query: "Tell me about Egypt"},
            {text: "Japan", query: "Tell me about Japan"},
            {text: "Brazil", query: "Tell me about Brazil"}
        ];
        addMessage("I'd love to help! Could you tell me which country or place you're interested in?", 'bot', suggestions);
        return;
    }
    
    try {
        // Search for the location using Knowledge Graph API
        const entityData = await searchKnowledgeGraph(location);
        
        if (!entityData || entityData.length === 0) {
            removeLoading();
            addMessage(`I couldn't find information about ${location}. Could you try another place?`, 'bot');
            return;
        }
        
        // Generate response based on topic
        const response = generateResponse(entityData, topic, location);
        removeLoading();
        
        // Generate relevant follow-up suggestions
        const suggestions = generateSuggestions(location, topic);
        
        // Add bot response with suggestions
        addMessage(response, 'bot', suggestions);
        
    } catch (error) {
        console.error('Error:', error);
        removeLoading();
        addMessage("I'm having trouble finding that information right now. Let's try something else!", 'bot');
    }
}

// Extract location from user query
function extractLocation(query) {
    // This is a simple extraction method - you might want to use NLP for better results
    const commonPlaces = [
        'france', 'paris', 'japan', 'tokyo', 'egypt', 'cairo', 'usa', 'united states',
        'china', 'beijing', 'india', 'delhi', 'brazil', 'rio', 'australia', 'sydney',
        'russia', 'moscow', 'canada', 'italy', 'rome', 'spain', 'madrid', 'germany',
        'berlin', 'uk', 'london', 'mexico', 'argentina', 'greece', 'athens', 'switzerland'
    ];
    
    const words = query.toLowerCase().split(/\s+/);
    
    for (const place of commonPlaces) {
        if (query.toLowerCase().includes(place)) {
            // Capitalize first letter of each word
            return place.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    }
    
    return null;
}

// Identify what topic the user is asking about
function identifyTopic(query) {
    const lowerQuery = query.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(travelTopics)) {
        for (const keyword of keywords) {
            if (lowerQuery.includes(keyword)) {
                return topic;
            }
        }
    }
    
    // Default to general facts if no specific topic is identified
    return 'facts';
}

// Search Knowledge Graph API
async function searchKnowledgeGraph(query) {
    const params = {
        query: query,
        limit: 10,
        indent: true,
        key: API_KEY
    };
    
    const url = new URL(KG_SEARCH_ENDPOINT);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.itemListElement && data.itemListElement.length > 0) {
            return data.itemListElement.map(item => item.result);
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching from Knowledge Graph:', error);
        throw error;
    }
}

// Generate response based on topic and entity data
function generateResponse(entityData, topic, location) {
    const entity = entityData[0]; // Use the top result
    
    // Extract relevant information
    const name = entity.name || location;
    const description = entity.description || '';
    const detailedDescription = entity.detailedDescription?.articleBody || '';
    
    // For demo purposes, we'll have some hardcoded responses since the Knowledge Graph
    // might not always return the specific information we want about capitals, languages, etc.
    const mockData = getMockData(location.toLowerCase());
    
    switch (topic) {
        case 'capital':
            return `The capital of ${name} is ${mockData.capital || 'a beautiful city'}. ${detailedDescription.substring(0, 100)}...`;
            
        case 'monuments':
            return `${name} is famous for ${mockData.monuments || 'many beautiful landmarks and attractions'}. ${description} ${detailedDescription.substring(0, 100)}...`;
            
        case 'languages':
            return `In ${name}, people speak ${mockData.languages || 'several languages'}. ${detailedDescription.substring(0, 100)}...`;
            
        case 'facts':
        default:
            return `${name}: ${description} ${detailedDescription} ${mockData.facts || 'It\'s an amazing place to explore!'}`;
    }
}

// Generate suggestions based on previous interaction
function generateSuggestions(location, previousTopic) {
    const suggestions = [];
    
    // Don't suggest the same topic again
    if (previousTopic !== 'capital') {
        suggestions.push({
            text: `Capital of ${location}`,
            query: `What is the capital of ${location}?`
        });
    }
    
    if (previousTopic !== 'monuments') {
        suggestions.push({
            text: `${location} monuments`,
            query: `Famous monuments in ${location}`
        });
    }
    
    if (previousTopic !== 'languages') {
        suggestions.push({
            text: `Languages in ${location}`,
            query: `What languages are spoken in ${location}?`
        });
    }
    
    if (previousTopic !== 'facts') {
        suggestions.push({
            text: `Fun facts`,
            query: `Tell me interesting facts about ${location}`
        });
    }
    
    // Always suggest a new place
    const newPlaces = ['Japan', 'Brazil', 'Egypt', 'Australia', 'Italy', 'India'];
    const randomPlace = newPlaces[Math.floor(Math.random() * newPlaces.length)];
    
    suggestions.push({
        text: `Explore ${randomPlace}`,
        query: `Tell me about ${randomPlace}`
    });
    
    // Return up to 4 suggestions
    return suggestions.slice(0, 4);
}

// Mock data for demonstration purposes
function getMockData(location) {
    const mockDatabase = {
        'france': {
            capital: 'Paris',
            languages: 'French',
            monuments: 'the Eiffel Tower, the Louvre Museum, and Mont Saint-Michel',
            facts: 'France is the most visited country in the world and has over 400 types of cheese!'
        },
        'japan': {
            capital: 'Tokyo',
            languages: 'Japanese',
            monuments: 'Mount Fuji, Kinkaku-ji (Golden Pavilion), and Tokyo Skytree',
            facts: 'Japan has over 6,800 islands and is home to the oldest company in the world, Kongō Gumi, founded in 578 AD!'
        },
        'egypt': {
            capital: 'Cairo',
            languages: 'Arabic',
            monuments: 'the Great Pyramids of Giza, the Sphinx, and the Valley of the Kings',
            facts: 'The ancient Egyptian civilization lasted for over 3,000 years, and hieroglyphics were used for over 3,500 years!'
        },
        'brazil': {
            capital: 'Brasília',
            languages: 'Portuguese',
            monuments: 'Christ the Redeemer, Amazon Rainforest, and Iguazu Falls',
            facts: 'Brazil is home to the largest rainforest in the world and has the most species of plants, freshwater fish, and mammals!'
        }
    };
    
    return mockDatabase[location] || {};
}

// Initial suggestions after a short delay to simulate the bot thinking
setTimeout(() => {
    const initialSuggestions = [
        {text: "Egypt's Monuments", query: "Famous monuments in Egypt"},
        {text: "Languages in Switzerland", query: "What languages are spoken in Switzerland?"},
        {text: "Japan Facts", query: "Tell me interesting facts about Japan"},
        {text: "Brazil's Capital", query: "What is the capital of Brazil?"}
    ];
    
    // Update the initial message with these suggestions
    const suggestionsContainer = document.getElementById('initial-suggestions');
    suggestionsContainer.innerHTML = '';
    
    initialSuggestions.forEach(suggestion => {
        const chip = document.createElement('button');
        chip.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2', 'mb-2');
        chip.textContent = suggestion.text;
        chip.onclick = () => askQuestion(suggestion.query);
        suggestionsContainer.appendChild(chip);
    });
}, 1000);