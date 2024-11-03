const API_KEY = CONFIG.API_KEY;
const OPENAI_API_URL = 'https://chatapi.akash.network/api/v1/chat/completions';

async function Bot(inputText) {
    const payload = {
      model: "Meta-Llama-3-1-8B-Instruct-FP8",
      messages: [
        {
          role: "user",
          content: `${inputText} Hi, can you summarize this post? Please ensure that no important details related to the core topic are missed.`
        }
      ],
    };

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', OPENAI_API_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
    
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                const textOutput = responseData.choices[0].message.content;
                resolve(textOutput);
              } catch (error) {
                console.error('Error parsing JSON:', error.message || error);
                reject(error);
              }
            } else {
              console.error('Error: Failed to summarize. Status:', xhr.status);
              reject(new Error(`Failed to summarize. Status: ${xhr.status}`));
            }
          }
        };
    
        xhr.onerror = function() {
          console.error('Request failed');
          reject(new Error('Request failed'));
        };
    
        xhr.send(JSON.stringify(payload));
      });
}

function convertToRichText(text) {
  // Convert bold (**text**) to <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic (*text*) to <em>
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert headers (# text) to <h1>, (## text) to <h2>, etc.
  text = text.replace(/#{1,6} (.+)/g, function(match, content) {
      const level = match.split(' ')[0].length;
      return `<h${level}>${content}</h${level}>`;
  });
  
  // Convert bullet points (* text) to <ul><li>
  text = text.replace(/^\* (.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Convert numbered lists (1. text) to <ol><li>
  text = text.replace(/^\d+\. (.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  
  // Convert line breaks to <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

async function createOverlay(Text) {
    const overlay = document.createElement('div');
    overlay.id = 'summary-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background-color: #ffffff;
        color: #333333;
        padding: 30px;
        border-radius: 10px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    content.innerHTML = `
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 24px; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">Summary</h2>
        <p style="color: #7f8c8d; font-size: 16px;">Writing the Summary...</p>
        <button id="close-overlay" style="
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            float: right;
        ">Close</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    document.getElementById('close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    document.getElementById('close-overlay').addEventListener('mouseover', (e) => {
        e.target.style.backgroundColor = '#2980b9';
    });

    document.getElementById('close-overlay').addEventListener('mouseout', (e) => {
        e.target.style.backgroundColor = '#3498db';
    });
    let richText = "Text is too short to Summarize.";
    if(Text.length>100){
      const summary = await Bot(Text);
      richText = convertToRichText(summary);
    }
    content.innerHTML = `
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 24px; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">Summary</h2>
        <code style="
            font-size: 16px;
            line-height: 1.6;
            color: #34495e;
            margin-bottom: 20px;
            white-space: pre-wrap;
        ">${richText}</code>
        <button id="close-overlay" style="
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            float: right;
        ">Close</button>
    `;

    document.getElementById('close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    document.getElementById('close-overlay').addEventListener('mouseover', (e) => {
        e.target.style.backgroundColor = '#2980b9';
    });

    document.getElementById('close-overlay').addEventListener('mouseout', (e) => {
        e.target.style.backgroundColor = '#3498db';
    });
    document.addEventListener('mousedown', function(event) {
        if (event.target != content && event.target.id != 'close-overlay') {
            document.body.removeChild(overlay);
        }
    });
}

//LinkedIn
function addSummaryButtonLI() {
    console.log("Adding summary button");
    const targetDivs = document.querySelectorAll('.update-v2-social-activity');
    console.log("Found target divs:", targetDivs.length);
    
    if (targetDivs.length > 0) {
        targetDivs.forEach((targetDiv) => {
            if (!targetDiv.querySelector('.summary-button')) {
                console.log("Creating new summary button");
                const summaryButton = document.createElement('button');
                summaryButton.textContent = 'Summarize';
                summaryButton.className = 'summary-button';

                summaryButton.style.cssText = `
                    background-color: transparent;
                    border: none;
                    color: rgba(0,0,0,0.6);
                    font-size: 14px;
                    font-weight: 600;
                    padding: 8px 12px;
                    margin-left: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s, color 0.3s;
                    border-radius: 4px;
                `;
                
                // Find the post URL
                const postLink = targetDiv.querySelector('a.app-aware-link');
                const postUrl = postLink ? postLink.href : 'Post URL not found';
                
                summaryButton.addEventListener('click', (e) => {
                    console.log("Summary button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    var TextDiv = summaryButton.parentElement;
                    TextDiv = TextDiv.parentElement;
                    TextDiv = TextDiv.parentElement;
                    TextDiv = TextDiv.querySelector('.feed-shared-update-v2__description-wrapper');
                    var Text = TextDiv.textContent;
                    createOverlay(Text);
                });
                
                // Hover effects (as before)
                summaryButton.addEventListener('mouseenter', () => {
                    summaryButton.style.backgroundColor = 'rgba(0,0,0,0.08)';
                    summaryButton.style.color = 'rgba(0,0,0,0.9)';
                });
                
                summaryButton.addEventListener('mouseleave', () => {
                    summaryButton.style.backgroundColor = 'transparent';
                    summaryButton.style.color = 'rgba(0,0,0,0.6)';
                });

                const actionBar = targetDiv.querySelector('.feed-shared-social-action-bar');
                if (actionBar) {
                    actionBar.appendChild(summaryButton);
                    console.log("Summary button added to target div");
                }
            }
        });
    }
}

//Twitter
function addSummaryButtonX() {
  const targetDivs = document.querySelectorAll('[data-testid="tweet"]');
  
  if (targetDivs.length > 0) {
    targetDivs.forEach((targetDiv) => {
      if (!targetDiv.querySelector('.summary-button')) {
        const summaryButton = document.createElement('button');
        summaryButton.textContent = 'Summarize';
        summaryButton.className = 'summary-button';

        summaryButton.style.cssText = `
          background-color: transparent;
          border: none;
          color: rgb(83, 100, 113);
          font-size: 13px;
          font-weight: 400;
          padding: 0 12px;
          height: 20px;
          cursor: pointer;
          transition: color 0.2s;
        `;
        
        summaryButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          var TextDiv = summaryButton.parentElement;
          TextDiv = TextDiv.parentElement.parentElement;
          TextDiv = TextDiv.parentElement.parentElement;
          TextDiv = TextDiv.querySelector('[data-testid="tweetText"]');
          var Text = TextDiv.textContent;
          createOverlay(Text);
        });
        
        summaryButton.addEventListener('mouseenter', () => {
          summaryButton.style.color = 'rgb(29, 155, 240)';
        });
        
        summaryButton.addEventListener('mouseleave', () => {
          summaryButton.style.color = 'rgb(83, 100, 113)';
        });

        const actionBar = targetDiv.querySelector('[role="group"]');
        if (actionBar) {
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.appendChild(summaryButton);
          actionBar.appendChild(wrapper);
        }
      }
    });
  }
}

//Medium
function addSummaryButtonMedium() {
  const targetDivs = document.querySelectorAll('article section');
  
  if (targetDivs.length > 0) {
    targetDivs.forEach((targetDiv) => {
      if (!targetDiv.querySelector('.summary-button')) {
        const summaryButton = document.createElement('button');
        summaryButton.textContent = 'Summarize';
        summaryButton.className = 'summary-button';

        summaryButton.style.cssText = `
          background-color: rgb(26, 137, 23);
          border: none;
          color: white !important;
          font-size: 14px;
          font-weight: 400;
          padding: 4px 8px;
          margin-left: 10px;
          cursor: pointer;
          transition: background-color 0.3s;
          border-radius: 99em;
        `;
        
        summaryButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          var TextDiv = targetDiv.querySelector(".pw-post-body-paragraph").parentElement;
          // TextDiv = TextDiv.parentElement.parentElement;
          // TextDiv = TextDiv.parentElement.parentElement;
          // TextDiv = TextDiv.querySelector('[data-testid="tweetText"]');
          var Text = TextDiv.textContent;
          createOverlay(Text);
        });
        
        summaryButton.addEventListener('mouseenter', () => {
          summaryButton.style.color = 'black';
        });
        
        summaryButton.addEventListener('mouseleave', () => {
          summaryButton.style.color = 'white';
        });

        const heading = targetDiv.querySelector('[data-testid="headerBookmarkButton"]').parentElement.parentElement.parentElement.parentElement.parentElement;
        if (heading) {
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.appendChild(summaryButton);
          heading.appendChild(wrapper);
        }
      }
    });
  }else{
    throw new Error("No target divs found");
  }
}

//Whatsapp
function addSummaryButtonWT() {
  const targetDivs = document.querySelectorAll('._akbu');
  console.log("Found target divs:", targetDivs.length);
  
  if (targetDivs.length > 0) {
      targetDivs.forEach((targetDiv) => {
          if (!targetDiv.parentElement.querySelector('.summary-button') && targetDiv.textContent.length>250) {
              console.log("Creating new summary button");
              const summaryButton = document.createElement('button');
              summaryButton.textContent = 'Summarize';
              summaryButton.className = 'summary-button';

              summaryButton.style.cssText = `
                  display: inline-block;
                  background-color: #0c1317;
                  border: none;
                  color: white;
                  font-size: 14px;
                  font-weight: 600;
                  padding: 8px 12px;
                  cursor: pointer;
                  transition: background-color 0.3s, color 0.3s;
                  border-radius: 4px;
              `;
              
              // Find the post URL
              const postLink = targetDiv.querySelector('a.app-aware-link');
              const postUrl = postLink ? postLink.href : 'Post URL not found';
              
              summaryButton.addEventListener('click', (e) => {
                  console.log("Summary button clicked");
                  e.preventDefault();
                  e.stopPropagation();
                  var Text = targetDiv.textContent;
                  createOverlay(Text);
              });
              
              // Hover effects (as before)
              summaryButton.addEventListener('mouseenter', () => {
                  summaryButton.style.backgroundColor = 'white';
                  summaryButton.style.color = '#0c1317';
              });
              
              summaryButton.addEventListener('mouseleave', () => {
                  summaryButton.style.backgroundColor = '#0c1317';
                  summaryButton.style.color = 'white';
              });

              if (targetDiv) {
                  targetDiv.parentElement.appendChild(summaryButton);
              }
          }
      });
  }
}

//Gmail
function addSummaryButtonGM() {
  const targetDivs = document.querySelectorAll('.ha');
  console.log("Found target divs:", targetDivs.length);
  
  if (targetDivs.length > 0) {
      targetDivs.forEach((targetDiv) => {
          if (!targetDiv.querySelector('.summary-button')) {
              console.log("Creating new summary button");
              const summaryButton = document.createElement('button');
              summaryButton.textContent = 'Summarize';
              summaryButton.className = 'summary-button';

              summaryButton.style.cssText = `
                  display: inline-block;
                  background-color: rgb(26, 137, 23);
                  border: none;
                  color: white;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: background-color 0.3s, color 0.3s;
                  border-radius: 4px;
              `;
              
              // Find the post URL
              const postLink = targetDiv.querySelector('a.app-aware-link');
              const postUrl = postLink ? postLink.href : 'Post URL not found';
              
              summaryButton.addEventListener('click', (e) => {
                  console.log("Summary button clicked");
                  e.preventDefault();
                  e.stopPropagation();
                  var Text = targetDiv.parentElement.parentElement.parentElement.parentElement.textContent;
                  createOverlay(Text);
              });
              
              // Hover effects (as before)
              summaryButton.addEventListener('mouseenter', () => {
                  summaryButton.style.backgroundColor = 'white';
                  summaryButton.style.color = 'rgb(26, 137, 23)';
              });
              
              summaryButton.addEventListener('mouseleave', () => {
                  summaryButton.style.backgroundColor = 'rgb(26, 137, 23)';
                  summaryButton.style.color = 'white';
              });

              if (targetDiv) {
                // targetDiv.insertBefore(summaryButton, targetDiv.parentElement.lastChild);
                targetDiv.appendChild(summaryButton);
              }
          }
      });
  }
}


let url = window.location.href;

if(url.includes("linkedin.com")){
  setInterval(addSummaryButtonLI, 2000);
}

if(url.includes("x.com")){
  setInterval(addSummaryButtonX, 2000);
}

if(url.includes("medium.com")){
  setInterval(addSummaryButtonMedium, 2000);
}

if(url.includes("whatsapp.com/")){
  setInterval(addSummaryButtonWT, 2000);
}

if(url.includes("mail.google.com")){
  setInterval(addSummaryButtonGM, 2000);
}

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
  console.log("Message received in content script", request);
  if (request.action === "summarize") {
    await createOverlay(request.text);
  }
  sendResponse({status: "received"});
  return true;
});