let numClicks = 0;

function initTours() {
  const triggers = document.querySelectorAll('.start-introjs');
  for (const trigger of triggers) {
    if (!trigger.dataset.target) {
      console.error(`invalid target selector: ${trigger.dataset.target}`);
      continue;
    }
    if (!document.querySelector(trigger.dataset.target)) {
      console.error(`Could not find target: ${trigger.dataset.target}`);
      continue;
    }
    //trigger.removeAttribute('href');
    console.log('adding event listener', trigger);
    trigger.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      startTour(trigger.dataset.target);
    });
  }
	const stepLists = document.querySelectorAll('.tour-steps');
	for (const stepList of stepLists) {
    if (stepList.dataset.skipInit) continue;
		initTour(stepList);
	}
}

function parseRange(rangeStr) {
  /**
   * returns an array of numbers in the given comma-separated list of ranges
   */
  const pattern = /(([0-9]+)(-([0-9]+))?)(,|$)/g
  const rangeArr = [];
  let match;
  while ((match = pattern.exec(rangeStr)) !== null) {
    let start = parseInt(match[2]);
    let end = parseInt(match[4]);
    if (isNaN(end)) end = start;
    for (let i=start; i <= end; i++) {
      rangeArr.push(i);
    }
  }
  return rangeArr;
}

function range(size, startAt=0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

function wrap(parent, re, className) {
  const orig = parent.innerHTML;
  const counter = parent.querySelectorAll('.wrapped').length + 1;
  const selectMatch = re.exec(parent.innerHTML);
  const matchedText = selectMatch[0];
  const html = `<span class="wrapped wrapped-${counter} ${className}">${matchedText}</span>`;
  parent.innerHTML = orig.substr(0, selectMatch.index) + html + orig.substr(selectMatch.index + matchedText.length);
  return parent.querySelector(`.wrapped-${counter}`);
}

function wrapLines(codeBox, range, className) {
  let lineNums = parseRange(range);
  const lines = lineNums.map(n => codeBox.querySelector(`.line-${n}`));
  const parent = lines[0].parentNode;
  const wrapper = document.createElement('div');
  wrapper.classList.add(className);
  parent.insertBefore(wrapper, lines[0]);
  lines.forEach(el => wrapper.appendChild(el));
  return wrapper;
}

function initTour(stepList) {
	// Set up introjs description attrs
	const tourSteps = Array.from(stepList.querySelectorAll('li'));
	const targetEl = document.querySelector(stepList.dataset.target);
	if (!targetEl) {
		console.error(`initTour: Could not find target: ${stepList.dataset.target}`);
		return;
	}
	for (const [i, step] of tourSteps.entries()) {
    let el = null;
    /** 
     * FIXME: this approach is overly complex and easy to break.
     *
     * A better approach would be to allow the range of lines or chars:
     * 
     *     {data-select="1-2"} // lines 1-2
     *     {data-select="1:2-10"} // line 1, chars 2-10
     */
    if (step.dataset.selectLines) {
      // if data-select-lines exists, create a wrapper around the lines
      el = wrapLines(targetEl, step.dataset.selectLines, 'tour-wrapper');
    } else if (step.dataset.selectRe) {
      // if data-select contains a regexp, create a wrapper around the match
      const selectReMatch = step.dataset.selectRe.match(/^\/(.*)\/(\w)?/);
      const re = new RegExp(selectReMatch[1], selectReMatch[2]);
      const matchTarget = step.dataset.select ? targetEl.querySelector(step.dataset.select) : targetEl;
      const selectMatch = re.exec(matchTarget.innerHTML);
      if (selectMatch) {
        const orig = matchTarget.innerHTML;
        const counter = targetEl.querySelectorAll('.tour-wrapper').length + 1;
        const matchedText = selectMatch[0];
        const html = `<span class="tour-wrapper tour-wrapper-${counter}">${matchedText}</span>`;
        matchTarget.innerHTML = orig.substr(0, selectMatch.index) + html + orig.substr(selectMatch.index + matchedText.length);
        el = matchTarget.querySelector(`.tour-wrapper-${counter}`);
      } else {
        console.error(`initTour: Could not find element: ${matchTarget} -> /${selectReMatch[1]}/${selectReMatch[2] || ''}`);
      }
    } else if (step.dataset.select) {
      // otherwise, use the selector as given
      el = targetEl.querySelector(step.dataset.select);
      if (!el) {
        console.error(`initTour: Could not find element: ${stepList.dataset.target} ${step.dataset.select}`);
      }
    }
    if (!el) continue;
    el.dataset.intro = step.textContent;
    el.dataset.step = i + 1;
	}
}

function hideIntroJsHeader() {
  const header = document.querySelector('.introjs-tooltip-header');
  if (header) {
    header.style.padding = '0';
    header.style.height = '0';
  }
}

function startTour(targetSelector) {
  const targetEl = document.querySelector(targetSelector);
  const intro = introJs(targetSelector).setOptions({showBullets: false});
  const event = new CustomEvent('intro-start', {detail: {intro: intro}})
  targetEl.dispatchEvent(event); 
  intro.start();
  hideIntroJsHeader();
}

function initBooleanQuiz() {
	/**
	 * Logical Operators activity
	 */
	const tables = document.querySelectorAll('.boolean-quiz');

  for (let table of tables) {
    const correctAnswers = [];
    for (let el of table.querySelectorAll('tbody td:nth-child(2)')) {
      correctAnswers.push(el.textContent.trim() === 'true');
      el.textContent = '';
    }

    const parentChapter = table.closest('.chapter');

    function clickBooleanButton() {
      const i = parseInt(this.dataset.index);
      for (let btn of this.parentNode.querySelectorAll('button')) {
        btn.classList.remove('active');
        btn.querySelector('input').checked = false;
      }
      if (this.classList.contains('true')) answers[i] = true;
      if (this.classList.contains('false')) answers[i] = false;
      this.classList.add('active');
      this.querySelector('input').checked = true;
      showMsg('', '');
    }

    function reset() {
      answers = [];
      answers.fill(null, 0, table.querySelectorAll('tbody td:nth-child(2)').length);
    }

    function checkAnswers() {
      if (answers.indexOf(null) !== -1) {
        showMsg('Oops! You need to select either true or false on each statement', 'incorrect');
        return;
      }
      console.log(answers);
      console.log(correctAnswers);
      if (JSON.stringify(answers) === JSON.stringify(correctAnswers)) {
        showMsg("That's correct!", 'correct');
      } else {
        showMsg('Not quite right, try again!', 'incorrect');
        setTimeout(() => {
          // flash the tips list
          const tips = parentChapter.querySelector('.tips');
          if (tips) {
            void tips.offsetWidth; // trigger reflow
            tips.classList.add('flash');
            setTimeout(() => tips.classList.remove('flash'), 4000);
          }
        }, 1000);
      }
    }

    function showMsg(msg, type) {
      const msgEl = parentChapter.querySelector('.check-answer td div');
      msgEl.textContent = msg;
      msgEl.className = type;
    }

    function makeButton(type, i) {
      const btn = document.createElement('button');
      btn.dataset.index = i;
      btn.classList.add('boolean');
      btn.classList.add(type);
      const chk = document.createElement('input');
      chk.setAttribute('type', 'checkbox');
      const spn = document.createElement('span');
      spn.textContent = type;
      btn.appendChild(chk);
      btn.appendChild(spn);
      btn.addEventListener('click', clickBooleanButton);
      return btn;
    }

    let answers = [];
    reset();

    // add the true/false buttons
    for (let [i, item] of table.querySelectorAll('tr td:nth-child(2)').entries()) {
      item.appendChild(makeButton('true', i));
      item.appendChild(makeButton('false', i));
    }

    const extraRow = document.createElement('tr');
    const cell = document.createElement('td');
    extraRow.className = 'check-answer';
    extraRow.appendChild(cell);
    table.appendChild(extraRow);
    cell.setAttribute('colspan', 2);
    const checkAnswersBtn = document.createElement('button');
    checkAnswersBtn.textContent = 'Check my answers'
    cell.appendChild(checkAnswersBtn);
    checkAnswersBtn.addEventListener('click', checkAnswers);
    cell.appendChild(document.createElement('div'));
  }
}

const pbjStorageKey = 'intro-to-js-activity-pbj-function-inputs'
function updatePBJFunctionBox(codeBox, doc) {
		let code = `function makeSandwich() {\n`;
		codeBox.innerHTML = '';
		const steps = JSON.parse(localStorage.getItem(pbjStorageKey));
		for (let step of steps) {
			code += `    console.log('${step}');\n`;
		}
		code += `}`;
		codeBox.innerHTML = code;
		doc.initCodeBlock(codeBox);
}

function initDefiningFunctionsActivity(doc) {
	const activity = document.querySelector('.functions-activity');
	const inputs = activity.querySelectorAll('.input-steps input');
	const codeBox = activity.querySelector('code.pbjcode');
	const pbjCodeBoxes = document.querySelectorAll('code.pbjcode');
	const showMe = activity.querySelector('.show-me');
	showMe.style.display = 'none';

	const update = function() {
		const toSave = [];
		for (let input of inputs) {
			if (input.value) {
				toSave.push(input.value);
			}
		}
		// save input values
		localStorage.setItem(pbjStorageKey, JSON.stringify(toSave));

		for (const codeBox of pbjCodeBoxes) {
			updatePBJFunctionBox(codeBox, doc);
		}

		// Wrap function body for intro.js
		const lines = Array.from(codeBox.querySelectorAll('.hljs-line'));

		// wrap opening and closing brace
		const last = lines.length-1;
		lines[0].innerHTML = lines[0].innerHTML.replace('{', '<span class="open-brace">{</span>');
		lines[last].innerHTML = lines[last].innerHTML.replace('}', '<span class="closing-brace">}</span>');
		const bodyLines = lines.splice(1, lines.length-2);
		if (bodyLines.length) {
			bodyLines[0].setAttribute('style', 'margin-top: 0');
			bodyLines[bodyLines.length-1].setAttribute('style', 'margin-bottom: 0');
		}
		const bodyContainer = document.createElement('span');
		bodyContainer.classList.add('function-body');
		lines[0].after(bodyContainer);
		for (let line of bodyLines) {
			bodyContainer.appendChild(line);
		}
		if (bodyLines.length) showMe.style.display = '';

    // update tour descriptions
    const stepList = activity.querySelector('.tour-steps');
    initTour(stepList);
	}

	for (const input of inputs) {
		input.addEventListener('keyup', update);
	}

	// load saved inputs (fail silently)
	try {
		const savedValues = JSON.parse(localStorage.getItem(pbjStorageKey));
    if (savedValues) {
      for (const [i, item] of Object.entries(savedValues)) {
        inputs[i].value = savedValues[i];
      }
      setTimeout(update);
      //document.addEventListener('DOMContentLoaded', update);
    }
	} catch (error) {
		console.error(error);
	};
}

function initQuizzes() {
  for (const quiz of document.querySelectorAll('.quiz')) {
    const questions = quiz.querySelectorAll('.quiz-question');
    const final = quiz.querySelector('.quiz-final');
    final.style.display = 'none';

    for (const [qNum, question] of Object.entries(questions)) {
      question.style.display = 'none';
      const choices = question.querySelector('ul.choices');
      if (!choices) {
        console.error(`Could not find choices for question #${parseInt(qNum) + 1}`);
        continue;
      }
      choices.classList.add('choices');
      const choiceItems = choices.querySelectorAll('li');
      const correctAnswers = Object.entries(choiceItems)
        .filter(([i, e]) => e.classList.contains('correct'))
        .map(([i, e]) => parseInt(i));
      const inputType = correctAnswers.length == 1 ? 'radio' : 'checkbox';
      for (const [i, choice] of Object.entries(choiceItems)) {
        const input = document.createElement('input');
        const label = document.createElement('label');
        label.innerHTML = choice.innerHTML;
        choice.innerHTML = '';
        input.setAttribute('type', inputType);
        input.name = `question${qNum}`;
        input.value = parseInt(i);
        label.prepend(input);
        choice.append(label);
      }

      choices.addEventListener('change', event => {
        for (const choice of choiceItems) {
          choice.classList[choice.querySelector('input').checked ? 'add' : 'remove']('selected');
        }
      });

      const buttons = document.createElement('div');
      buttons.classList.add('buttons');

      const nextBtn = document.createElement('a');
      nextBtn.className = 'btn next';
      nextBtn.textContent = 'Next';
      nextBtn.style.visibility = 'hidden';
      nextBtn.addEventListener('click', event => {
        question.style.display = 'none';
        const next = questions[parseInt(qNum) + 1];
        if (next) {
          next.style.display = '';
        } else {
          final.style.display = '';
          const numCorrect = quiz.querySelectorAll('.quiz-question.correct').length;
          const total = quiz.querySelectorAll('.quiz-question').length;
          for (const el of quiz.querySelectorAll('.total-score')) {
            el.textContent = `${numCorrect}/${total}`;
          }
        }
      });

      const checkAnswerBtn = document.createElement('a');
      checkAnswerBtn.className = 'btn submit';
      checkAnswerBtn.textContent = 'Submit';
      checkAnswerBtn.addEventListener('click', event => {
        if (question.classList.contains('result')) return;
        question.classList.add('result');
        if (choices.querySelector('li.correct:not(.selected)')) {
          question.classList.add('incorrect');
          checkAnswerBtn.textContent = 'Incorrect.';
        } else {
          question.classList.add('correct');
          checkAnswerBtn.textContent = 'Correct!';
        }
        for (const input of question.querySelectorAll('input')) {
          input.setAttribute('disabled', 'disabled');
        }
        checkAnswerBtn.classList.add('disabled');
        nextBtn.style.visibility = 'visible';
      });

      buttons.appendChild(checkAnswerBtn);
      buttons.appendChild(nextBtn);
      choices.after(buttons);
    }

    questions[0].style.display = '';

    quiz.querySelector('.btn.try-again').addEventListener('click', event => {
      event.preventDefault();
      const questions = quiz.querySelectorAll('.quiz-question');
      questions.forEach(q => {
        q.style.display = 'none';
        q.classList.remove('result');
        q.classList.remove('correct');
        q.classList.remove('incorrect');
        const submitBtn = q.querySelector('.btn.submit');
        submitBtn.classList.remove('disabled');
        submitBtn.textContent = 'Submit';
        q.querySelector('.btn.next').style.visibility = 'hidden';
        q.querySelectorAll('.choices li').forEach(el => {
          el.classList.remove('selected');
          el.querySelector('input').removeAttribute('disabled');
        });
      });
      questions[0].style.display = '';
      quiz.querySelector('.quiz-final').style.display = 'none';
    });
  }
}

let __docLoaded = false;
function onDocReady(fn) {
  if (__docLoaded) {
    fn();
  } else {
    window.doc.addEventListener('loaded', fn);
  }
}
window.doc.addEventListener('loaded', () => __docLoaded = true);
/*
booleanQuizzes();
definingFunctions(doc);
initQuizzes();
initTours();
*/