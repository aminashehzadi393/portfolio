/* Amina AI — client-side chat assistant widget. Loaded on every page.
   Builds its own DOM, so pages only need <script src="ai-chat.js"></script>. */
(function () {
  'use strict';

  if (document.getElementById('aiChatFab')) return; // init once

  var LINKEDIN = 'https://www.linkedin.com/in/amina-shehzadi-seo-digital-marketing-webdevelopment/';
  var GITHUB = 'https://github.com/aminashehzadi393';
  var EMAIL = 'aminashehzadi393@gmail.com';
  var CV = 'assets/Amina-Shehzadi-CV.pdf';

  function link(url, text) {
    return '<a href="' + url + '" target="_blank" rel="noopener">' + text + '</a>';
  }

  var CHIPS = ['Skills', 'Projects', 'Experience', 'Contact'];

  var INTENTS = [
    {
      name: 'rankcheck',
      patterns: [/rankcheck/i, /seo\s*analyzer/i],
      reply: 'RankCheck is a free SEO analyzer that scores any page 0\u2013100 across 15 on-page checks. It hit 100/100 on PageSpeed SEO. Try it: ' + link('https://aminashehzadi393.github.io/seo-analyzer/', 'live demo')
    },
    {
      name: 'foodexpress',
      patterns: [/foodexpress/i, /food\s*delivery/i],
      reply: 'FoodExpress is a responsive food delivery website with menu search and filters, a cart, and a checkout flow. See it: ' + link('https://aminashehzadi393.github.io/Food-delivery-project/', 'live demo')
    },
    {
      name: 'papermaker',
      patterns: [/papermaker/i, /test\s*paper/i, /question\s*bank/i],
      reply: 'PaperMaker generates printable board-style test papers for 9th-class Math (Lahore Board) from a question bank, with a separate answer key. Try it: ' + link('https://aminashehzadi393.github.io/papermaker/', 'live demo')
    },
    {
      name: 'roadmap',
      patterns: [/roadmap/i, /llm\s*engineer(ing)?\s*road/i, /learning\s*road/i],
      reply: 'Her LLM Engineering Roadmap is a public learning path: Python \u2192 PyTorch \u2192 RAG & AI agents, built in the open. Follow it: ' + link('https://github.com/aminashehzadi393/llm-engineering', 'GitHub')
    },
    {
      name: 'cv',
      patterns: [/\bcv\b/i, /resume/i, /\b biodata \b/i],
      reply: 'Here is her CV: <a href="' + CV + '" download>Download PDF</a>'
    },
    {
      name: 'contact',
      patterns: [/contact/i, /\bemail\b/i, /phone/i, /number/i, /whatsapp/i, /reach/i, /linkedin/i, /\bgithub\b/i, /social/i],
      reply: 'You can reach her at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or +92 334 5754865. Also on ' + link(LINKEDIN, 'LinkedIn') + ' and ' + link(GITHUB, 'GitHub') + '.'
    },
    {
      name: 'hire',
      patterns: [/hire/i, /availab/i, /freelance/i, /collaborat/i, /opportunit/i, /job/i, /work with/i, /project for me/i],
      reply: 'Yes! She is open to freelance builds, collaborations, and AI projects. The fastest way is the <a href="contact.html">contact form</a> or emailing ' + EMAIL + '.'
    },
    {
      name: 'education',
      patterns: [/education/i, /degree/i, /universit/i, /college/i, /\bstud(y|ied|ies)\b/i, /qualification/i, /fsc/i],
      reply: 'BS Computer Science, University of the Punjab, Lahore (2023\u2013Present), and FSc Pre-Engineering (2021\u20132023).'
    },
    {
      name: 'experience',
      patterns: [/experience/i, /intern/i, /worked/i, /work history/i, /career/i, /corvit/i, /devxui/i],
      reply: 'She has been a <b>Freelance AI & Web Developer since 2024</b> (4 live projects, client SEO work), was a UI/UX Intern at devxui, Bangladesh (Nov\u2013Dec 2025), and an SEO Trainee at Corvit Systems, Lahore (Feb\u2013May 2025).'
    },
    {
      name: 'skills',
      patterns: [/skill/i, /\bstack\b/i, /technolog/i, /expert/i, /good at/i, /know/i],
      reply: 'Her main stack is <b>AI/LLM</b>: Python, Prompt Engineering, RAG, AI Agents (deep-diving into PyTorch & fine-tuning). Supporting skills: HTML/CSS/JS, WordPress, and on-page/off-page/technical SEO.'
    },
    {
      name: 'llm',
      patterns: [/\bllm\b/i, /\bai\b/i, /model training/i, /fine[- ]tun/i, /pytorch/i, /\brag\b/i, /machine learning/i, /artificial intelligence/i, /agent/i],
      reply: 'LLM engineering & model training is her main focus \u2014 she is deep-diving into PyTorch, RAG, AI agents, and fine-tuning. Her public roadmap: ' + link('https://github.com/aminashehzadi393/llm-engineering', 'GitHub') + '.'
    },
    {
      name: 'seo',
      patterns: [/\bseo\b/i, /search engine/i, /rank/i, /keyword/i, /backlink/i],
      reply: 'SEO is one of her supporting skills: on-page, off-page, and technical SEO plus keyword research and site performance \u2014 she even built her own SEO analyzer, RankCheck.'
    },
    {
      name: 'webdev',
      patterns: [/web\s*dev/i, /website/i, /frontend/i, /front-end/i, /wordpress/i, /html/i, /javascript/i],
      reply: 'She builds fast, responsive sites with HTML/CSS/JS and WordPress \u2014 3 of her projects are live on GitHub Pages. Ask me about them under "Projects".'
    },
    {
      name: 'projects',
      patterns: [/project/i, /portfolio/i, /built/i, /work/i, /\bapps?\b/i],
      reply: 'She has shipped 4 projects: <b>RankCheck</b> (SEO analyzer), <b>FoodExpress</b> (food delivery app), <b>PaperMaker</b> (test paper generator) \u2014 all live \u2014 plus her public <b>LLM Engineering Roadmap</b>. Ask me about any of them!'
    },
    {
      name: 'about',
      patterns: [/who is/i, /about/i, /introduce/i, /tell me about (her|amina)/i, /\bher\b.*\b(name|intro)/i],
      reply: '<b>Amina Shehzadi</b> is an LLM Engineer specializing in AI and model training, with supporting expertise in web development and SEO. She learns in public and ships real projects.'
    },
    {
      name: 'thanks',
      patterns: [/thank/i, /shukriya/i, /\bthx\b/i, /great/i, /awesome/i, /nice/i],
      reply: 'You are welcome! Anything else you would like to know about Amina\u2019s work?'
    },
    {
      name: 'bye',
      patterns: [/\bbye\b/i, /khuda hafiz/i, /allah hafiz/i, /goodbye/i, /see you/i],
      reply: 'Allah Hafiz! Feel free to come back anytime. \uD83D\uDC4B'
    },
    {
      name: 'greeting',
      patterns: [/\b(hi+|hello|hey|salam|salaam|aoa|assalamu?\s*alaikum)\b/i, /\bnams?te\b/i],
      reply: 'Walaikum Assalam! \uD83D\uDC4B I am <b>Amina AI</b>. Ask me about her <b>skills</b>, <b>projects</b>, <b>experience</b>, or how to <b>contact</b> her.'
    }
  ];

  var FALLBACK = 'I can tell you about Amina\u2019s <b>skills</b>, <b>projects</b>, <b>experience</b>, <b>education</b>, or <b>contact</b> info \u2014 what would you like to know?';

  function getReply(text) {
    for (var i = 0; i < INTENTS.length; i++) {
      var it = INTENTS[i];
      for (var j = 0; j < it.patterns.length; j++) {
        if (it.patterns[j].test(text)) return it.reply;
      }
    }
    return FALLBACK;
  }

  /* ---------- Build widget DOM ---------- */
  var fab = document.createElement('button');
  fab.id = 'aiChatFab';
  fab.setAttribute('aria-label', 'Chat with Amina AI');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span class="ai-fab-label">AI</span>';

  var panel = document.createElement('div');
  panel.id = 'aiChatPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Amina AI chat');
  panel.innerHTML =
    '<div class="ai-header">' +
      '<div><strong>Amina AI</strong><span>Ask me about Amina\u2019s work</span></div>' +
      '<button id="aiChatClose" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="ai-messages" id="aiChatMessages"></div>' +
    '<div class="ai-chips" id="aiChatChips"></div>' +
    '<form class="ai-input" id="aiChatForm">' +
      '<input type="text" id="aiChatInput" placeholder="Ask about skills, projects\u2026" autocomplete="off" aria-label="Type your message">' +
      '<button type="submit" aria-label="Send">&#10148;</button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var messages = document.getElementById('aiChatMessages');
  var chipsBox = document.getElementById('aiChatChips');
  var form = document.getElementById('aiChatForm');
  var input = document.getElementById('aiChatInput');
  var closeBtn = document.getElementById('aiChatClose');
  var opened = false;
  var greeted = false;

  function scrollDown() { messages.scrollTop = messages.scrollHeight; }

  function addMsg(html, who) {
    var d = document.createElement('div');
    d.className = 'ai-msg ' + who;
    if (who === 'user') { d.textContent = html; }
    else { d.innerHTML = html; }
    messages.appendChild(d);
    scrollDown();
    return d;
  }

  function showChips() {
    chipsBox.innerHTML = '';
    CHIPS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ai-chip';
      b.textContent = c;
      b.addEventListener('click', function () { sendUser(c); });
      chipsBox.appendChild(b);
    });
  }

  function botSay(html) {
    var t = document.createElement('div');
    t.className = 'ai-msg bot typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t);
    scrollDown();
    setTimeout(function () {
      t.classList.remove('typing');
      t.innerHTML = html;
      scrollDown();
    }, 650 + Math.random() * 350);
  }

  function greetingReply() {
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].name === 'greeting') return INTENTS[i].reply;
    }
    return FALLBACK;
  }

  function sendUser(text) {
    text = (text || '').trim();
    if (!text) return;
    addMsg(text, 'user');
    botSay(getReply(text));
  }

  function openChat() {
    panel.classList.add('open');
    fab.classList.add('active');
    opened = true;
    if (!greeted) {
      greeted = true;
      botSay(greetingReply());
    }
    setTimeout(function () { input.focus(); }, 250);
  }

  function closeChat() {
    panel.classList.remove('open');
    fab.classList.remove('active');
    opened = false;
  }

  fab.addEventListener('click', function () { opened ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && opened) closeChat();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    sendUser(v);
  });

  showChips();
})();
