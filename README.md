# Data Science Mids Guide

Interactive study guide for the **Data Science mid-term**. Easy notes built from handwritten class notes and the exam-preparation notes, with Urdu examples, live graphs, scenario practice, quizzes and a real **Python code judge**. Plain HTML, CSS and JavaScript: no build step, no backend, works on GitHub Pages.

## Mid-term topics covered
1. Data Science and the lifecycle
2. Roles in Data Science
3. Big Data (the 5 Vs)
4. Data types
5. Data acquisition
6. Statistics for Data Science
7. Classification metrics
8. Overfitting and underfitting
9. Tools, data cleaning and charts (Python libraries, Python vs Orange vs Weka)

38 short lessons, each with a key point, tables, worked examples and mid-exam style questions.

## What you can do
- **Labs (graphs and calculators)**
  - Lifecycle builder (put the stages in order)
  - Confusion matrix: change TP/TN/FP/FN and see accuracy, precision, recall, specificity, F1 and the accuracy paradox
  - Descriptive statistics: histogram, box plot, outliers, mean vs median
  - Correlation with scatter plots (including the ice-cream and drowning trap)
  - Normal curve with the 68-95-99.7 rule and z-scores
  - Hypothesis test (z-test) with the p-value and rejection region
  - Over/underfitting: move model complexity and watch training and test error
  - Data cleaning: duplicates, missing values, inconsistent text, impossible ages
  - **Python code judge**: 15 exercises (calculator, accuracy, precision/recall, F1, mean/median/mode, std dev, correlation, diagnose a model, clean data). Your code runs as real Python in the browser (Pyodide) and tests judge the output
- **Scenarios**: 32 case-based scenarios across all 9 topics. Calculation answers are graded automatically (accepts `0.85`, `85%` or `40/50`). Guided mode (hints) and exam mode (timer, no leaks until submit)
- **Quiz**: 107 concept questions plus 13 Python "predict the output" questions. Quick, Scenario, Mixed, Topic Practice and a 30-question Mock Exam, with topic-wise results and weak-topic links
- **Revise**: flashcards, searchable glossary and a printable cheat sheet
- Progress is saved in the browser only (it does not sync across devices)

## Project structure
```
index.html            all lessons and pages
css/style.css         theme, layout, print rules
css/labs.css          charts, labs and code-judge styles
js/core.js            navigation, lessons, progress, classify game
js/charts.js          dependency-free SVG charts
js/labs.js            interactive labs
js/judge.js           Python code judge (Pyodide in a Web Worker)
js/judge-data.js      code exercises, tests and reference solutions
js/scenario-data.js   scenario content
js/scenarios.js       scenario engine (guided and exam modes)
js/quiz-data.js       quiz questions
js/quiz-modes.js      quiz modes and mock exam
js/revise.js          flashcards and glossary
js/progress.js        local progress storage
DS-Mids-Study-Guide.pdf   printable notes
```

## Run locally
Open `index.html` in a browser. The first time you press **Run** in the Python judge, the Python engine (about 10 MB) is downloaded from a CDN, so that part needs internet once.

## Deploy (GitHub Pages)
Repository **Settings → Pages → Deploy from a branch → `main` / root**. The site will be at `https://haronkhalid.github.io/DS-MIDs/`.

## Adding content
- Scenarios: edit `js/scenario-data.js` (question types `single`, `multi`, `match`, `number`, `written`)
- Quiz questions: edit `js/quiz-data.js`
- Code exercises: edit `js/judge-data.js` (each test is a Python expression and its expected value)

## Notes
- Exam mode is for practice. The site is static, so answers are in the page source and it is not a secure exam.
- The Python judge runs in a Web Worker; an infinite loop is stopped after 8 seconds.
