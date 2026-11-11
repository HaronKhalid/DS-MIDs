# Data Science Mids Guide

Interactive study guide for the **Data Science mid-term**. Scope (confirmed): lecture plan **Weeks 1, 2, 3, 4, 5, 6, 7 and 10**, plus the points from the handwritten class notes that belong to those weeks. Easy notes with Urdu examples, live graphs, scenario practice, quizzes, a **Python playground** that runs real pandas and NumPy code in the browser (made for phones) and a **Python code judge**. Plain HTML, CSS and JavaScript: no build step, no backend, works on GitHub Pages.

## Topics covered
| Week | Topic |
|---|---|
| 1 | Introduction to Data Science: definition, history, applications, DS vs AI vs ML vs Data Analytics, lifecycle, roles |
| 2 | Python for Data Science: syntax, data types, collections, operators and conditions, loops and functions, NumPy, libraries |
| 3 | Data Acquisition: primary/secondary data, structured/semi-structured/unstructured, CSV/Excel/JSON/databases/APIs, data quality |
| 4 | Data Cleaning: missing values, duplicates, inconsistent data, outliers, categorical encoding, feature scaling |
| 5 | Pandas and Data Manipulation: Series, DataFrame, inspecting, filtering, sorting, groupby, aggregation, merge and join |
| 6 | Exploratory Data Analysis: univariate/bivariate/multivariate, descriptive statistics, correlation vs causation |
| 7 | Data Visualization: Matplotlib, Seaborn, chart choice, heatmaps, visualization principles |
| 10 | Machine Learning Fundamentals: ML lifecycle, supervised/unsupervised/reinforcement, classification vs regression, train/validation/test split, underfitting and overfitting |

49 short lessons, each with a key point, tables, worked examples and mid-exam style questions. Every code example marked with an output was run to check it, and can be run again from the lesson with the ▶ Run button.

## What you can do
- **Labs** (each tagged with its week)
  - Lifecycle builder (W1)
  - **Python playground** (W2 to W10): write and run your own Python on a phone or laptop, nothing to install
    - `numpy`, `pandas` and `matplotlib` load automatically when the code imports them; `seaborn`, `scipy`, `sklearn` and `sqlite3` also work
    - VS Code style editor: syntax colours, line numbers, auto-indent, a row of symbol keys for phone keyboards, text size buttons
    - Output panel: printed text, DataFrames as tables, charts from `plt.show()`, clear error messages with the line marked, and `input()` with an answer box
    - 20 ready examples grouped by week, practice files (`students.csv`, `sales.csv`, `cities.csv`, `marks.json`) and **Add a file** for your own CSV
    - Every code block in the lessons has **Copy** and **▶ Run**, which opens it in the playground
  - **Python code judge** (W2 and later): 18 exercises. Your code runs as real Python in the browser (Pyodide) and tests judge the output
  - Scaling and encoding (W4): min-max, z-score, label and one-hot encoding
  - Data cleaning (W4): duplicates, missing values, inconsistent text, impossible ages
  - Pandas explorer (W5): head, describe, filter, sort, groupby, value_counts, merge, with the matching pandas code
  - Descriptive statistics (W6): histogram, box plot, outliers, mean vs median
  - Correlation (W6): scatter plots and the ice-cream and drowning trap
  - Chart chooser (W7): seven chart types, including a misleading-axis demo and a correlation heatmap
  - Train/validation/test split (W10)
  - Over/underfitting (W10): move model complexity and watch training and test error
- **Scenarios**: 42 case-based scenarios across all 8 topics. Calculation answers are graded automatically (accepts `0.25`, `25%` or `1/4`). Guided mode (hints) and exam mode (timer, no leaks until submit)
- **Quiz**: 127 concept questions plus 19 Python/pandas "predict the output" questions. Quick, Scenario, Mixed, Topic Practice and a 30-question Mock Exam, with week-wise results and weak-topic links
- **Revise**: flashcards, searchable glossary and a printable cheat sheet
- Progress is saved in the browser only (it does not sync across devices)

## Project structure
```
index.html            all lessons and pages
css/style.css         theme, layout, print rules
css/labs.css          charts and labs
css/code.css          code editor, output panel and syntax colours (VS Code Dark+)
js/core.js            navigation, lessons, progress, classify game, week list
js/charts.js          dependency-free SVG charts (bar, line, scatter, histogram, box, pie, heatmap)
js/labs.js            lifecycle, cleaning, statistics, correlation, fitting labs
js/labs-more.js       scaling, Pandas explorer, chart chooser, train/test split labs
js/pyengine.js        Python engine: Pyodide in a Web Worker, loads libraries on demand, captures output, charts and errors
js/editor.js          code editor and Python syntax colouring
js/playground.js      Python playground lab, its examples and the Run buttons on lesson code
js/judge.js           Python code judge
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
Open `index.html` in a browser. The first time you press **Run** in the Python playground or judge, the Python engine (about 10 MB) is downloaded from a CDN, and pandas + NumPy (about 9 MB) the first time your code imports them. The browser keeps them, so later runs are fast.

## Deploy (GitHub Pages)
Repository **Settings → Pages → Deploy from a branch → `main` / root**. The site will be at `https://haronkhalid.github.io/DS-MIDs/`.

## Adding content
- Scenarios: edit `js/scenario-data.js` (question types `single`, `multi`, `match`, `number`, `written`)
- Quiz questions: edit `js/quiz-data.js`
- Code exercises: edit `js/judge-data.js` (each test is a Python expression and its expected value)
- Playground examples: edit `PG_EXAMPLES` in `js/playground.js`; practice files: `PY_FILES` in `js/pyengine.js`

## Notes
- Exam mode is for practice. The site is static, so answers are in the page source and it is not a secure exam.
- Python runs in a Web Worker. An infinite loop is stopped after 30 seconds in the playground (or with the Stop button) and after 8 seconds in the judge.
- The playground shows the value of the last line like a notebook. `input()` works by re-running the program with the answers given so far, so the program should not depend on the clock.
- Code typed in the playground is saved in the browser only.
- Topics outside the confirmed mid-term scope (Big Data 5 Vs, classification metrics, hypothesis testing and probability, Orange/Weka) were removed. They remain in the git history if they are needed for the final.
