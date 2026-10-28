import './style.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
let chosenTheme = null;
try { chosenTheme = localStorage.getItem('shipmate-theme'); } catch { /* Theme switching still works without storage access. */ }
if (!['light', 'dark'].includes(chosenTheme)) chosenTheme = null;
const themeButton = document.querySelector('.theme-toggle');
function applyTheme() {
  const theme = chosenTheme || (themeMedia.matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const label = chosenTheme ? `${theme === 'dark' ? 'Dark' : 'Light'} theme` : 'System theme';
  document.querySelector('#theme-label').textContent = label;
  themeButton.setAttribute('aria-label', `${label}. Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#20211e' : '#f8f7f4';
}
applyTheme();
themeMedia.addEventListener('change', applyTheme);
themeButton.addEventListener('click', () => {
  chosenTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('shipmate-theme', chosenTheme); } catch { /* Theme switching still works without storage access. */ }
  applyTheme();
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  menuToggle.firstElementChild.className = 'ph ph-list';
}
menuToggle.addEventListener('click', () => {
  if (!mobileNav.hidden) return closeMenu();
  mobileNav.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close navigation');
  menuToggle.firstElementChild.className = 'ph ph-x';
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

const capabilities = {
  landing: {
    icon: 'browser',
    title: 'Give your idea\na launch address.',
    description: 'From a half-styled template to a responsive, polished site with working forms, analytics, and a reason to click.',
    deliverables: ['Responsive design', 'Forms & integrations', 'SEO foundations', 'Launch checks'],
  },
  tools: {
    icon: 'sliders-horizontal',
    title: 'Less busywork.\nMore useful software.',
    description: 'Turn your scrappy dashboard into a tool your team can actually use, with connected data, sensible permissions, and reliable workflows.',
    deliverables: ['Connected data', 'Team permissions', 'Workflow automation', 'Useful reporting'],
  },
  prototypes: {
    icon: 'cube',
    title: 'A real first version.\nNot another mockup.',
    description: 'Get your core idea in front of real users. We connect the essential flows, test what matters, and keep the scope launchable.',
    deliverables: ['Working sign-in', 'Payment connections', 'Core user journeys', 'Staging & testing'],
  },
};

function animatePanel(panel) {
  const pieces = [...panel.querySelectorAll('.capability-symbol, h3, #capability-description, .deliverable-list li, .scope-note, .issue-header, .issue-list li, .builder-note')];
  pieces.forEach((piece, index) => {
    piece.getAnimations().filter(animation => animation.id === 'panel-reveal').forEach(animation => animation.cancel());
    if (reducedMotion.matches) return;
    const animation = piece.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 420, delay: index * 32, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    animation.id = 'panel-reveal';
  });
}

function setupTabs(tablist, onSelect) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const select = (tab, moveFocus = false) => {
    tabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    onSelect(tab);
    if (moveFocus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      const vertical = tablist.getAttribute('aria-orientation') === 'vertical';
      if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
      if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(tabs[next], true);
      }
    });
  });
  return select;
}

setupTabs(document.querySelector('.capability-tabs'), tab => {
  const category = capabilities[tab.dataset.category];
  const panel = document.querySelector('#capability-panel');
  panel.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#capability-icon').className = `ph ph-${category.icon}`;
  const heading = document.querySelector('#capability-heading');
  heading.replaceChildren();
  const titleLines = category.title.split('\n');
  heading.append(document.createTextNode(titleLines[0]), document.createElement('br'), document.createTextNode(titleLines[1]));
  document.querySelector('#capability-description').textContent = category.description;
  const list = document.querySelector('#deliverable-list');
  list.replaceChildren();
  category.deliverables.forEach(text => {
    const item = document.createElement('li');
    item.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i>';
    item.append(document.createTextNode(text));
    list.append(item);
  });
  animatePanel(panel);
});

const projectDays = {
  audit: {
    title: "First, find what's in the way.",
    count: '4 priorities',
    issues: [
      ['Customer data visible to other users', 'Blocking'],
      ['Checkout stops at the payment form', 'Blocking'],
      ['Private API keys in the published app', 'Blocking'],
      ['No booking confirmation email', 'To build'],
    ],
    message: 'The booking screen looks good. Behind it, there are three things I would not launch with. I’m starting with data access and exposed keys, then connecting payments.',
    next: 'auth',
    nextLabel: 'Next: the fixes',
  },
  auth: {
    title: 'Make the foundations safer.',
    count: '2 fixes reviewed',
    issues: [
      ['Customers can only see their own data', 'Reviewed'],
      ['Keys moved server-side and rotated', 'Reviewed'],
      ['Connect and verify payment flow', 'In progress'],
      ['No booking confirmation email', 'To build'],
    ],
    message: 'Access rules are in place and tested with two separate accounts. The exposed keys have been rotated. Next up: making sure a payment actually creates a booking.',
    next: 'payments',
    nextLabel: 'Next: it connects',
  },
  payments: {
    title: 'Connect the pieces that matter.',
    count: '3 flows tested',
    issues: [
      ['Successful payment creates a booking', 'Tested'],
      ['Failed payments show a useful message', 'Tested'],
      ['Confirmation email reaches the customer', 'Tested'],
      ['Complex scheduling rules need a specialist', 'Escalated'],
    ],
    message: 'Book, pay, confirm now works in staging. The scheduling rules need deeper engineering, so I’ve prepared a handover rather than guessing. Please try the checkout with a test card.',
    next: 'review',
    nextLabel: 'Next: launch review',
  },
  review: {
    title: 'A review, not a leap of faith.',
    count: 'Ready for your review',
    issues: [
      ['Auth and payment checks documented', 'Reviewed'],
      ['Mobile and error states tested', 'Tested'],
      ['Specialist scheduling handover prepared', 'Prepared'],
      ['Production deployment needs your approval', 'Your review'],
    ],
    message: 'Your staging link and launch checklist are ready. Known limits are documented, including specialist scheduling and load testing. Have a look; nothing goes live until you approve it.',
    next: 'audit',
    nextLabel: 'Replay the project',
  },
};
const timelineTabs = document.querySelector('.timeline-tabs');
const timelineIndicator = document.createElement('span');
timelineIndicator.className = 'timeline-indicator';
timelineIndicator.setAttribute('aria-hidden', 'true');
timelineTabs.append(timelineIndicator);
timelineTabs.classList.add('has-indicator');
function moveTimelineIndicator(tab, animate = true) {
  const padding = parseFloat(getComputedStyle(tab).paddingLeft);
  if (!animate) timelineIndicator.style.transition = 'none';
  timelineIndicator.style.transform = `translateX(${tab.offsetLeft + padding}px) scaleX(${tab.offsetWidth - padding * 2})`;
  if (!animate) {
    void timelineIndicator.offsetWidth;
    timelineIndicator.style.removeProperty('transition');
  }
}
new ResizeObserver(() => moveTimelineIndicator(timelineTabs.querySelector('[aria-selected="true"]'), false)).observe(timelineTabs);

let currentDay = 'audit';
function renderDay(tab) {
  currentDay = tab.dataset.day;
  moveTimelineIndicator(tab);
  const day = projectDays[currentDay];
  const panel = document.querySelector('#timeline-panel');
  panel.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#issue-title').textContent = day.title;
  document.querySelector('#issue-count').textContent = day.count;
  document.querySelector('#builder-message').textContent = day.message;
  const issueList = document.querySelector('#issue-list');
  issueList.replaceChildren();
  day.issues.forEach(([title, status]) => {
    const item = document.createElement('li');
    const resolved = ['Reviewed', 'Tested', 'Prepared'].includes(status);
    const icon = document.createElement('i');
    icon.className = `ph ph-${resolved ? 'check-circle' : status === 'Blocking' ? 'warning-circle' : 'circle-dashed'}`;
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = title;
    const badge = document.createElement('span');
    badge.className = `issue-status${resolved ? ' resolved' : ''}`;
    badge.textContent = status;
    item.append(icon, label, badge);
    issueList.append(item);
  });
  document.querySelector('#next-day').firstChild.textContent = `${day.nextLabel} `;
  animatePanel(panel);
}
const selectDay = setupTabs(document.querySelector('.timeline-tabs'), renderDay);
renderDay(document.querySelector('#day-audit'));
document.querySelector('#next-day').addEventListener('click', () => {
  selectDay(document.querySelector(`#day-${projectDays[currentDay].next}`));
  document.querySelector('#timeline-panel').focus({ preventScroll: true });
});

const dialog = document.querySelector('#project-dialog');
const form = document.querySelector('#brief-form');
const formView = document.querySelector('#brief-form-view');
const successView = document.querySelector('#brief-success');
let currentBrief = null;
let dialogTrigger = null;
document.querySelectorAll('[data-start]').forEach(button => {
  button.addEventListener('click', () => {
    dialogTrigger = button;
    closeMenu();
    formView.hidden = false;
    successView.hidden = true;
    document.querySelector('#project-plan').value = button.dataset.plan || 'Not sure yet';
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.classList.remove('is-closing');
    dialog.showModal();
    void dialog.offsetWidth;
    dialog.classList.add('is-open');
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
  });
});
function closeBrief() {
  if (dialog.classList.contains('is-closing')) return;
  dialog.classList.remove('is-open');
  dialog.classList.add('is-closing');
  const closeMs = reducedMotion.matches ? 0 : parseFloat(getComputedStyle(dialog).getPropertyValue('--modal-close-dur'));
  window.setTimeout(() => dialog.close(), closeMs);
}
document.querySelector('.dialog-close').addEventListener('click', closeBrief);
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeBrief();
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeBrief();
  }
});
dialog.addEventListener('close', () => {
  dialog.classList.remove('is-open', 'is-closing');
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus({ preventScroll: true });
});

const errorFields = [
  ['founder-name', 'name-error'],
  ['founder-email', 'email-error'],
  ['project-link', 'project-error'],
  ['project-goal', 'goal-error'],
];
errorFields.forEach(([id, errorId]) => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    document.getElementById(errorId).textContent = '';
  });
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const project = form.elements.project.value.trim();
  const goal = form.elements.goal.value.trim();
  let validProject = false;
  try { validProject = ['http:', 'https:'].includes(new URL(project).protocol); } catch { validProject = false; }
  const messages = [
    name ? '' : 'Please enter your name.',
    email && form.elements.email.validity.valid ? '' : 'Enter a valid email address.',
    validProject ? '' : 'Enter a project link beginning with https:// or http://.',
    goal ? '' : 'Tell us what you would like to ship.',
  ];
  let firstInvalid = null;
  errorFields.forEach(([id, errorId], index) => {
    const input = document.getElementById(id);
    const invalid = Boolean(messages[index]);
    input.setAttribute('aria-invalid', String(invalid));
    document.getElementById(errorId).textContent = messages[index];
    if (invalid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  currentBrief = { name, email, project, plan: form.elements.plan.value, goal };
  const summary = document.querySelector('#brief-summary');
  summary.replaceChildren();
  [['Your name', name], ['Email', email], ['Project', project], ['Plan', currentBrief.plan], ['The finish line', goal]].forEach(([label, value]) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    summary.append(term, detail);
  });
  formView.hidden = true;
  successView.hidden = false;
  dialog.setAttribute('aria-labelledby', 'success-title');
  dialog.scrollTop = 0;
  document.querySelector('#success-title').focus({ preventScroll: true });
});

document.querySelector('#download-brief').addEventListener('click', () => {
  if (!currentBrief) return;
  const { name, email, project, plan, goal } = currentBrief;
  const content = `SHIPMATE PROJECT BRIEF\n\nName: ${name}\nEmail: ${email}\nProject: ${project}\nInterested in: ${plan}\n\nWHAT DONE LOOKS LIKE\n${goal}\n\nNEXT STEP\nAttach a five-minute walkthrough of your project.\n\nThis brief was created locally. It has not been submitted, and no subscription or payment has been created.\n`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'shipmate-project-brief.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#edit-brief').addEventListener('click', () => {
  successView.hidden = true;
  formView.hidden = false;
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  document.querySelector('#founder-name').focus();
});

const revealElements = [...document.querySelectorAll('.reveal')];
document.querySelectorAll('.benefit-grid, .pricing-grid, .process-list').forEach(group => {
  group.querySelectorAll('.reveal').forEach((element, index) => element.style.setProperty('--reveal-delay', `${index * 90}ms`));
});
document.querySelectorAll('.promise-strip > span').forEach((element, index) => element.style.setProperty('--item-index', index));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08 });
if (!reducedMotion.matches) {
  revealElements.forEach(element => revealObserver.observe(element));
  document.documentElement.classList.add('js-ready');
} else {
  revealElements.forEach(element => element.classList.add('is-visible'));
}
document.addEventListener('focusin', event => {
  event.target.closest('.reveal')?.classList.add('is-visible');
});

const header = document.querySelector('.site-header');
const sentinel = document.createElement('div');
sentinel.className = 'header-sentinel';
sentinel.setAttribute('aria-hidden', 'true');
header.before(sentinel);
new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);

const tilt = document.querySelector('.t-tilt');
const tiltCard = tilt.querySelector('.t-tilt-card');
let tiltFrame = 0;
function resetTilt() {
  cancelAnimationFrame(tiltFrame);
  tiltFrame = 0;
  tilt.classList.remove('is-hover');
  tiltCard.classList.remove('is-tilting');
  tiltCard.style.setProperty('--tilt-rx', '0deg');
  tiltCard.style.setProperty('--tilt-ry', '0deg');
}
tilt.addEventListener('pointermove', event => {
  if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse' || tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    tiltFrame = 0;
    const bounds = tilt.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    tilt.classList.add('is-hover');
    tiltCard.classList.add('is-tilting');
    tiltCard.style.setProperty('--tilt-rx', `${(0.5 - y) * 7}deg`);
    tiltCard.style.setProperty('--tilt-ry', `${(x - 0.5) * 7}deg`);
    tiltCard.style.setProperty('--tilt-gx', `${x * 100}%`);
    tiltCard.style.setProperty('--tilt-gy', `${y * 100}%`);
  });
});
tilt.addEventListener('pointerleave', resetTilt);
tilt.addEventListener('pointercancel', resetTilt);

const magnetResets = [];
document.querySelectorAll('.button').forEach(button => {
  [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => {
    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = node.textContent;
    node.replaceWith(label);
  });
  let frame = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    button.style.removeProperty('--magnet-x');
    button.style.removeProperty('--magnet-y');
  };
  magnetResets.push(reset);
  button.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse' || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = button.getBoundingClientRect();
      button.style.setProperty('--magnet-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 8}px`);
      button.style.setProperty('--magnet-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 6}px`);
    });
  });
  button.addEventListener('pointerleave', reset);
  button.addEventListener('pointercancel', reset);
  button.addEventListener('blur', reset);
});

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  resetTilt();
  magnetResets.forEach(reset => reset());
  revealObserver.disconnect();
  revealElements.forEach(element => element.classList.add('is-visible'));
  document.documentElement.classList.remove('js-ready');
  document.getAnimations().filter(animation => animation.id === 'panel-reveal').forEach(animation => animation.finish());
});
finePointer.addEventListener('change', () => {
  resetTilt();
  magnetResets.forEach(reset => reset());
});
