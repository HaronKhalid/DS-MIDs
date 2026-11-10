/* Scenario content (data only). The UI lives in scenarios.js.
   Mid-term scope: lecture-plan weeks 1-7 and week 10. "chapter" = topic number 1..8 (see WEEKS in core.js):
   1 Intro (W1), 2 Python (W2), 3 Acquisition (W3), 4 Cleaning (W4), 5 Pandas (W5), 6 EDA (W6), 7 Visualization (W7), 8 ML fundamentals (W10).
   Question types: single, multi (select all, partial credit), match (classify items), number (calculation), written (self-assessed).
   Optional fields: chart (drawn by charts.js), code (shown as a code block), hint (guided mode).
   Every number and code output used below was checked by running it. */
const qSingle=(prompt,options,a,explain)=>({type:"single",prompt,options,answer:[a],explain,marks:1});
const qMulti=(prompt,options,a,explain)=>({type:"multi",prompt,options,answer:a,explain,marks:2});
const qMatch=(prompt,categories,items,explain)=>({type:"match",prompt,categories,items:items.map(([t,a])=>({t,a})),explain,marks:items.length});
const qNum=(prompt,answer,tol,explain)=>({type:"number",prompt,answer,tol,explain,marks:1});
const qWritten=(prompt,model)=>({type:"written",prompt,model,marks:0});
const withCode=(q,code)=>({...q,code});
const sol=(problem,concepts,apply,recs,just,mistakes)=>({problem,concepts,apply,recs,just,mistakes});

const SCENARIOS=[
/* ============ TOPIC 1 / WEEK 1: Introduction to Data Science ============ */
{id:"c1-what-is-ds",title:"What goes into Data Science?",chapter:1,category:"identify",difficulty:"easy",minutes:5,
 tags:["definition"],related:["c1-1"],
 description:"A friend asks: “Is Data Science just programming?” You explain that it uses data to produce useful insights, and that it mixes several kinds of knowledge.",
 questions:[
  qMulti("According to the notes, which three kinds of knowledge are mixed in Data Science?",["Statistics","Programming","Domain knowledge","Graphic design"],[0,1,2],"Statistics, programming and domain knowledge."),
  qSingle("Data Science is best described as:",["Extracting useful insights from raw data","Only storing data in databases","Only drawing charts","Only building websites"],0,"The aim is turning raw data into insight and knowledge.")],
 solution:sol(["Common misunderstanding that DS = coding."],["Definition of Data Science."],["Statistics + programming + domain knowledge → insights from raw data."],["Explain with an example such as predicting student performance."],"Data Science is interdisciplinary.",["Reducing it to one skill."])},

{id:"c1-ds-vs-ai",title:"AI, ML, Data Science or Data Analytics?",chapter:1,category:"identify",difficulty:"medium",minutes:8,
 tags:["ds-vs-ai"],related:["c1-4"],
 description:"A company brochure uses the words AI, machine learning, data science and data analytics as if they meant the same thing. A new employee must tell them apart.",
 hint:"AI is the biggest idea, ML is one way of doing AI, data analytics explains data, data science uses many tools to get insight.",
 questions:[
  qMatch("Which term best fits each description?",["Artificial Intelligence","Machine Learning","Data Science","Data Analytics"],[["Machines doing tasks that normally need human intelligence",0],["Algorithms that learn patterns from data instead of following fixed rules",1],["Combining statistics, programming and domain knowledge to get insight from data",2],["Examining past sales data and showing it in reports and dashboards",3]],"AI is the broad goal; ML is a subset of AI; DS is interdisciplinary; DA focuses on examining and reporting data."),
  qSingle("Which statement about the relationship is correct?",["Machine Learning is a subset of Artificial Intelligence","Artificial Intelligence is a subset of Machine Learning","Data Analytics and AI are exactly the same thing","Machine Learning has nothing to do with data"],0,"ML is one approach within the wider field of AI. Data science uses ML as one of its tools.")],
 solution:sol(["Four terms are often mixed up."],["AI, ML, DS and DA."],["Match the description to the scope of each term."],["Use precise terms in reports."],"The terms overlap but are not identical.",["Saying ‘AI = ML = Data Science’."])},

{id:"c1-applications",title:"Where is Data Science used?",chapter:1,category:"identify",difficulty:"easy",minutes:6,
 tags:["applications"],related:["c1-3"],
 description:"A student collects examples of Data Science from daily life and groups them by industry.",
 questions:[
  qMatch("Match each example to its field.",["Healthcare","Banking / finance","E-commerce and media","Agriculture"],[["Predicting a patient's disease risk from test results",0],["Detecting fraudulent card transactions",1],["Recommending videos or products to a user",2],["Predicting crop yield from weather and soil data",3],["Scoring who is likely to repay a loan",1]],"Data Science applies to every field that has data.")],
 solution:sol(["Many industries use data science."],["Applications of Data Science."],["Match the task to the domain."],["Look for data-driven tasks in your own field."],"Applications span health, finance, retail, education, transport and more.",["Thinking DS is only for technology companies."])},

{id:"c1-student-fail",title:"Predicting which students will fail",chapter:1,category:"identify",difficulty:"easy",minutes:6,
 tags:["lifecycle"],related:["c1-5"],
 description:"A university wants to warn students who may fail the course. It has attendance sheets, assignment marks and last year's results stored in different systems. The team lead says: “Before touching any data, let's agree on what exactly we are trying to predict and how we will know it works.”",
 hint:"Which lifecycle step is about understanding what to solve?",
 questions:[
  qSingle("Which lifecycle step is the team lead describing?",["Problem definition","Model evaluation","Deployment","Data cleaning"],0,"Problem definition: first understand what must be solved, including the target and success criteria."),
  qMatch("Match each activity to its lifecycle stage.",["Problem definition","Data collection","Data cleaning","EDA","Model building"],[["Decide the goal: predict who will fail",0],["Gather attendance and marks from the university systems",1],["Fix missing attendance values and duplicates",2],["Plot marks against attendance to find patterns",3],["Train a model on past results",4]],"Follow the order: define → collect → clean → explore → model.")],
 solution:sol(["The team needs to turn a vague worry into a clear prediction task."],["Data Science lifecycle: problem definition first."],["Goal and success criteria are agreed before any data work."],["Then collect, clean, explore, model, evaluate, deploy, monitor."],"The lifecycle starts with understanding the problem; the wrong problem means wasted effort.",["Jumping straight to modelling.","Skipping the success criteria."])},

{id:"c1-skipped-eval",title:"The model that got worse after launch",chapter:1,category:"diagnose",difficulty:"medium",minutes:9,
 tags:["lifecycle","evaluation"],related:["c1-5"],
 description:"A shop trained a sales-prediction model and deployed it straight away because it ‘looked good’ on the data it was trained on. Six months later, predictions are often wrong because customer behaviour has changed. Nobody has checked the model since launch.",
 hint:"Two lifecycle steps are missing or neglected here.",
 questions:[
  qSingle("Which step should have happened BEFORE deployment?",["Model evaluation on unseen data","Problem definition","Data acquisition","Another round of training on the same data"],0,"Evaluation tests the model on unseen rows to check it generalises."),
  qSingle("Which step was neglected AFTER deployment?",["Monitoring and maintenance","Data cleaning","EDA","Feature scaling"],0,"Monitoring tracks performance, data drift and retraining needs."),
  qMulti("Select ALL things monitoring would track.",["Model performance over time","Data drift","Errors","The colour of the dashboard"],[0,1,2],"Colours are irrelevant; performance, drift and errors matter."),
  qWritten("Explain why a model that looks good on training data can still fail, and which two lifecycle steps prevent this.","A model can memorise training data and fail on unseen data, so it must be evaluated on unseen rows before deployment. After deployment, the world changes (data drift), so the model must be monitored and retrained when needed.")],
 solution:sol(["Evaluation skipped; no monitoring."],["Evaluation (unseen data) and monitoring and maintenance."],["Training performance is not proof of real performance."],["Hold out test data; monitor performance and drift after launch."],"Deployment is not the end of the lifecycle.",["Treating deployment as the final step."])},

{id:"c1-who-does-what",title:"Who does which job?",chapter:1,category:"identify",difficulty:"easy",minutes:6,
 tags:["roles"],related:["c1-6"],
 description:"A company has a data team. Four tasks arrive on Monday morning and the manager must decide who handles each.",
 hint:"Think: pipelines → engineer, reports → analyst, models → scientist, production → ML engineer.",
 questions:[
  qMatch("Assign each task to the best-suited role.",["Data Scientist","Data Analyst","Data Engineer","Machine Learning Engineer"],[["Build Spark/Kafka pipelines that move data into the warehouse",2],["Create a Tableau dashboard of monthly sales",1],["Build a statistical model in Python to predict churn",0],["Deploy the churn model to production using Docker",3]],"Engineer = pipelines; analyst = reporting and visualisation; scientist = modelling and statistics; ML engineer = deploying models."),
  qSingle("Which role focuses strongly on reporting and descriptive analysis?",["Data Analyst","Data Engineer","ML Engineer","Data Architect"],0,"Exam focus: analysts report and visualise.")],
 solution:sol(["Four tasks, four roles."],["Data Scientist, Analyst, Engineer, ML Engineer."],["Match by main responsibility and typical tools."],["Clarify ownership early."],"Roles overlap, but each has a main responsibility.",["Calling every data job ‘data scientist’."])},

{id:"c1-startup-hire",title:"The startup's first data hire",chapter:1,category:"choose",difficulty:"medium",minutes:9,
 tags:["roles"],related:["c1-6"],
 description:"A delivery startup logs orders in several apps, spreadsheets and a small database. Data is scattered, delayed and often broken. The founders can afford one data hire now. They want reliable, up-to-date data first; fancy predictions can wait.",
 hint:"What is the main blocker: modelling or data flow?",
 questions:[
  qSingle("Who should be hired first?",["Data Engineer","Data Scientist","Machine Learning Engineer","Business presenter only"],0,"The main problem is getting data into reliable pipelines. Engineers build the infrastructure."),
  qSingle("Later, who would build dashboards for the founders?",["Data Analyst","Data Engineer","Data Architect","No one"],0,"Analysts focus on reporting and visualisation."),
  qWritten("Justify your hiring order for the first three data roles.","Data Engineer first (pipelines and reliable data), then Data Analyst (reports and dashboards), then Data Scientist and ML Engineer when there is clean data and a prediction problem to solve and deploy.")],
 solution:sol(["Scattered, unreliable data."],["Role responsibilities."],["Pipelines before models."],["Hire engineer → analyst → scientist/ML engineer."],"Models cannot succeed without dependable data.",["Hiring a scientist before data is accessible."])},

/* ============ TOPIC 2 / WEEK 2: Python for Data Science ============ */
{id:"c2-collections",title:"Which Python collection?",chapter:2,category:"choose",difficulty:"easy",minutes:7,
 tags:["collections"],related:["c2-3"],
 description:"A beginner is writing small Python programs and must pick the right collection type for each job.",
 hint:"List = ordered and changeable, tuple = ordered but fixed, set = unique items, dictionary = key → value.",
 questions:[
  qMatch("Pick the best collection for each job.",["list","tuple","set","dictionary"],[["Marks of 5 students in order; you may add more later",0],["A fixed (latitude, longitude) pair that must not change",1],["The distinct cities that appear in a survey (no repeats)",2],["Look up a student's marks by name",3]],"Lists are ordered and changeable; tuples are fixed; sets keep unique items; dictionaries map keys to values."),
  withCode(qSingle("What does this code print?",["3","6","2","{1, 2, 3}"],0,"A set removes duplicates, so {1, 2, 3} has 3 items."),"print(len(set([1, 2, 2, 3, 3, 3])))")],
 solution:sol(["Four jobs, four collections."],["list, tuple, set, dict."],["Match properties to the job."],["Practise indexing lists and keys in dictionaries."],"Choose the collection by its properties.",["Using a list when unique items are needed."])},

{id:"c2-list-vs-array",title:"List or NumPy array?",chapter:2,category:"interpret",difficulty:"medium",minutes:9,
 tags:["numpy"],related:["c2-6"],
 description:"A student expects Python lists and NumPy arrays to behave the same way. They run a few lines and get surprising results.",
 hint:"A list + list joins them; an array does maths on every element.",
 questions:[
  withCode(qSingle("What does this print?",["[1, 2, 3]","[4, 5]","[1, 2, 1, 2]","[2, 4]"],0,"For lists, + joins (concatenates) the lists."),"print([1, 2] + [3])"),
  withCode(qSingle("What does this print (NumPy imported as np)?",["[4 5]","[1, 2, 3]","[1, 2, 1, 2]","Error"],0,"For a NumPy array, + 3 adds 3 to every element (vectorised)."),"print(np.array([1, 2]) + 3)"),
  withCode(qSingle("What does this print?",["[1, 2, 1, 2]","[2, 4]","[1, 2]","Error"],0,"List * 2 repeats the list."),"print([1, 2] * 2)"),
  withCode(qSingle("What does this print (NumPy imported as np)?",["[2 4]","[1, 2, 1, 2]","[1 2 1 2]","Error"],0,"Array * 2 multiplies every element by 2."),"print(np.array([1, 2]) * 2)"),
  qWritten("Give two reasons data scientists prefer NumPy arrays for numerical work.","Arrays hold one data type and are stored compactly, so maths is much faster. Operations are vectorised: one expression works on all elements (a.mean(), a * 2) without writing loops. Arrays also support easy indexing, slicing and reshaping.")],
 solution:sol(["Lists and arrays treat + and * differently."],["List vs NumPy array; vectorised operations."],["+ joins lists but adds element-wise for arrays."],["Use NumPy for numerical computing."],"NumPy arrays are built for fast element-wise maths.",["Assuming list + list adds the numbers."])},

{id:"c2-loop-output",title:"Trace the loop",chapter:2,category:"apply",difficulty:"easy",minutes:6,
 tags:["loops"],related:["c2-5"],
 description:"The homework task asks you to use an array, a loop and a condition. Read the program and work out its output by hand, then write down what it prints.",
 hint:"Write the value of i at each step and check whether it is even.",
 questions:[
  withCode(qNum("What number does this program print?",6,0.001,"i takes 1, 2, 3, 4. Only the even values 2 and 4 are added: 2 + 4 = 6."),"total = 0\nfor i in range(1, 5):\n    if i % 2 == 0:\n        total += i\nprint(total)"),
  qSingle("What does range(1, 5) produce?",["1, 2, 3, 4","1, 2, 3, 4, 5","0, 1, 2, 3, 4","2, 3, 4, 5"],0,"range(start, stop) includes start and stops before stop."),
  qSingle("What does i % 2 == 0 test?",["Whether i is even","Whether i is odd","Whether i equals 2","Whether i is zero"],0,"% gives the remainder; remainder 0 after dividing by 2 means even.")],
 solution:sol(["Hand-trace a loop with a condition."],["for loop, range, modulus, if."],["Even numbers 2 and 4 are summed."],["Trace with a small table."],"Reading code carefully is a core Python skill.",["Including 5 in range(1, 5)."])},

{id:"c2-libraries",title:"Which Python library?",chapter:2,category:"identify",difficulty:"easy",minutes:6,
 tags:["libraries"],related:["c2-7"],
 description:"A data scientist needs different libraries for different jobs in one project.",
 hint:"NumPy = numbers, Pandas = data tables, Matplotlib/Seaborn = charts, scikit-learn = ML.",
 questions:[
  qMatch("Which library fits each task?",["NumPy","Pandas","Matplotlib","Seaborn","Scikit-learn"],[["np.array() and np.mean()",0],["Loading a CSV and using groupby and merge",1],["plt.plot(), plt.bar(), plt.scatter()",2],["sns.heatmap() and sns.boxplot()",3],["train_test_split()",4]],"From the notes: each library has typical key functions.")],
 solution:sol(["Library selection."],["Python data libraries."],["Match function to library."],["Learn the core function of each."],"Each library has a main purpose.",["Using Matplotlib for data cleaning."])},

/* ============ TOPIC 3 / WEEK 3: Data Acquisition ============ */
{id:"c3-primary-secondary",title:"Primary or secondary data?",chapter:3,category:"identify",difficulty:"easy",minutes:5,
 tags:["acquisition"],related:["c3-2"],
 description:"A researcher studies how students spend their study time. She uses several data sources.",
 hint:"Did she collect it herself for this study, or did someone else already collect it?",
 questions:[
  qMatch("Classify each source.",["Primary data","Secondary data"],[["Interviews she conducts with students",0],["A national education dataset from a government repository",1],["A questionnaire she designs and hands out",0],["An open dataset downloaded from a public data repository",1],["A survey she runs on social media",0],["Data from another organisation's cloud database",1]],"Primary: collected directly for the current purpose (interview, survey, questionnaire). Secondary: already collected by someone else (repository, database, cloud).")],
 solution:sol(["Different data sources."],["Primary vs secondary data."],["Who collected it, and for what purpose."],["Check permission and quality for secondary data."],"Primary data is collected directly; secondary data already exists.",["Assuming secondary data is always accurate."])},

{id:"c3-structure",title:"Structured, semi-structured or unstructured?",chapter:3,category:"identify",difficulty:"easy",minutes:6,
 tags:["structure"],related:["c3-3"],
 description:"A hospital stores many kinds of data. The data team must label each source by its structure before choosing tools.",
 hint:"Fixed table → structured. Tags/keys (JSON/XML) → semi-structured. No tabular form → unstructured.",
 questions:[
  qMatch("Classify each data source.",["Structured","Semi-structured","Unstructured"],[["SQL table of patient records",0],["JSON response from a lab API",1],["X-ray images",2],["XML configuration file",1],["Doctors' free-text notes",2],["Audio recordings of consultations",2]],"Structured: fixed rows and columns. Semi-structured: flexible keys/tags (JSON, XML). Unstructured: images, text, audio, video.")],
 solution:sol(["Mixed hospital data."],["Structured, semi-structured, unstructured."],["Classify by structure."],["Use SQL for tables, parsers for JSON/XML, specialised tools for images/text."],"Structure decides how data is stored and processed.",["Calling JSON unstructured."])},

{id:"c3-formats",title:"Which format or source?",chapter:3,category:"choose",difficulty:"medium",minutes:8,
 tags:["formats"],related:["c3-4"],
 description:"Four teams need to bring data into Python for analysis. Each data source looks different.",
 hint:"Think about how each source stores its data and how Python reads it.",
 questions:[
  qMatch("Match each situation to the best-fitting source.",["CSV file","Excel file","JSON / API","Database"],[["Sales records exported as plain text, one row per line, values separated by commas",0],["A multi-sheet workbook prepared by the finance office",1],["A weather service returns key-value data when your program sends a request",2],["Millions of customer records that many apps read and update using SQL",3]],"CSV: plain text table. Excel: workbook with sheets. JSON from an API: key-value data returned by a web service. Database: organised storage queried with SQL."),
  withCode(qSingle("What does this program print?",["80","Ali","marks","[70, 80]"],0,"json.loads turns the text into a Python dictionary; data['marks'][1] is the second mark."),"import json\ntext = '{\"name\": \"Ali\", \"marks\": [70, 80]}'\ndata = json.loads(text)\nprint(data[\"marks\"][1])")],
 solution:sol(["Four data sources."],["CSV, Excel, JSON, databases, APIs."],["Match the situation to the format."],["Use pd.read_csv / read_excel / json / SQL."],"The source decides how you read the data.",["Treating an API response like a CSV."])},

{id:"c3-concerns",title:"Scraping reviews for a project",chapter:3,category:"diagnose",difficulty:"medium",minutes:9,
 tags:["acquisition","quality"],related:["c3-5","c3-6"],
 description:"A student downloads 50,000 product reviews from a website and some shoppers' public profile details to analyse customer opinions. Nearly all reviews are from one city. The site has terms of use that nobody read. Some reviews are duplicates and some ratings are missing.",
 hint:"Look for risks in permission, privacy, bias and data quality.",
 questions:[
  qMulti("Select ALL concerns the student should raise.",["Permission and terms of use","Privacy of personal details","Collection bias (almost one city)","Data quality (duplicates and missing ratings)"],[0,1,2,3],"All four are real acquisition concerns."),
  qSingle("Reviews from one city only are mainly a problem of:",["Collection bias","Duplicate records","Syntax errors","Storage cost"],0,"A sample from one city may not represent all customers."),
  qSingle("Duplicate rows and missing ratings affect:",["Data quality","Data velocity","Data type","Data storage cost only"],0,"Quality dimensions include completeness, uniqueness and accuracy."),
  qWritten("List four things to check before using this data.","Check permission/terms of use, protect privacy and remove personal details, assess whether the sample is representative (bias), check quality: duplicates, missing values, format and reliability.")],
 solution:sol(["Legal, privacy, bias and quality risks."],["Data acquisition concerns and data quality."],["Check source, consent, representativeness, completeness and uniqueness."],["Get permission, anonymise, widen the sample, clean the data."],"Good analysis starts with responsibly acquired, trustworthy data.",["Collecting first and asking questions later."])},

{id:"c3-quality",title:"Which quality dimension is broken?",chapter:3,category:"diagnose",difficulty:"medium",minutes:8,
 tags:["quality"],related:["c3-6"],
 description:"A data analyst inspects a student table and finds six different problems. Each problem breaks a different data-quality dimension.",
 hint:"Accuracy = correct, completeness = present, consistency = same format, validity = follows rules, uniqueness = no duplicates, timeliness = up to date.",
 questions:[
  qMatch("Name the quality dimension each problem breaks.",["Accuracy","Completeness","Consistency","Validity","Uniqueness","Timeliness"],[["The same student appears in two rows",4],["Marks are missing for three students",1],["‘Lahore’ is also spelled ‘lahore’ and ‘LHR’",2],["Marks of −5 (marks cannot be negative)",3],["A student's recorded age is 250",0],["The table is three years old; many students have left",5]],"The six dimensions: accuracy, completeness, consistency, validity, uniqueness, timeliness.")],
 solution:sol(["Six data-quality problems."],["Data quality dimensions."],["Match each problem to its dimension."],["Fix in the cleaning step."],"Data quality has several dimensions.",["Mixing up validity and accuracy."])},

/* ============ TOPIC 4 / WEEK 4: Data Cleaning ============ */
{id:"c4-cleaning",title:"Cleaning a messy student table",chapter:4,category:"diagnose",difficulty:"medium",minutes:10,
 tags:["cleaning"],related:["c4-1","c4-3"],
 description:"A dataset of students has: a missing marks value, the same student listed twice, cities written as ‘Lahore’, ‘lahore ’ and ‘LAHORE’, and one age of 250.",
 hint:"Do not just delete rows; first understand why.",
 questions:[
  qMatch("Pick the appropriate fix.",["Remove duplicates","Impute or investigate","Standardise spelling/case","Investigate: error or real value?"],[["The same student appears twice",0],["A marks value is missing",1],["‘Lahore’, ‘lahore ’, ‘LAHORE’",2],["An age of 250",3]],"Cleaning = detect and correct inaccurate, incomplete, inconsistent, duplicate or irrelevant data."),
  qSingle("Which statement about outliers is best?",["Investigate whether they are errors or legitimate values","Always delete them","Always keep them","Replace with zero"],0,"Exam focus: cleaning is not simply deleting bad rows."),
  qSingle("Filling a missing numeric value with the column mean is called:",["Imputation","Normalisation","Encoding","Merging"],0,"Imputation replaces missing values with a justified estimate.")],
 solution:sol(["Four data-quality problems."],["Data cleaning."],["Duplicate, missing, inconsistent, outlier."],["Fix each with a justified method."],"Understand why a value is wrong before changing it.",["Deleting rows blindly."])},

{id:"c4-missing",title:"Filling a missing salary",chapter:4,category:"choose",difficulty:"medium",minutes:9,
 tags:["missing"],related:["c4-2"],
 description:"A company's salary column (in thousand Rs) is: 30, 32, (missing), 36, 38, 400. One employee, the owner, earns 400. The analyst must fill the missing value without distorting the data.",
 chart:{type:"bars",title:"Known salaries (thousand Rs)",items:[["E1",30],["E2",32],["E4",36],["E5",38],["Owner",400]]},
 hint:"Which average is pulled upward by the 400?",
 questions:[
  qNum("What is the mean of the five known salaries (thousand Rs)?",107.2,0.1,"(30 + 32 + 36 + 38 + 400) / 5 = 536 / 5 = 107.2."),
  qNum("What is their median (thousand Rs)?",36,0.01,"Sorted: 30, 32, 36, 38, 400, the middle value is 36."),
  qSingle("Which fill value is more sensible here, and why?",["The median (36), because the outlier distorts the mean","The mean (107.2), because it uses all data","Zero, because the value is unknown","400, the largest salary"],0,"The mean is pulled up by the outlier; the median is robust."),
  qSingle("If only 1 row in 10,000 is missing completely at random, a reasonable option is to:",["Delete that row","Delete the whole column","Fill with the largest value","Stop the project"],0,"Deleting a tiny number of rows loses almost nothing.")],
 solution:sol(["A missing value plus an outlier."],["Imputation: mean vs median."],["Median 36 is robust; mean 107.2 is distorted."],["Impute with the median; investigate the outlier."],"Choose the imputation method to suit the data.",["Using the mean on skewed data."])},

{id:"c4-outliers",title:"Spot the outlier with the IQR rule",chapter:4,category:"apply",difficulty:"hard",minutes:12,
 tags:["outliers"],related:["c4-4","c6-4"],
 description:"Nine response times (seconds) were recorded: 4, 5, 6, 7, 8, 9, 10, 11, 40. Use the IQR rule: a value is an outlier if it is below Q1 − 1.5×IQR or above Q3 + 1.5×IQR. Compute quartiles with linear interpolation: position = (n − 1) × p on the sorted list.",
 chart:{type:"box",xlabel:"response time (s)",q:{min:4,q1:6,med:8,q3:10,max:11,outliers:[40]}},
 hint:"With n = 9, Q1 is at position 2 and Q3 at position 6 (counting from 0).",
 questions:[
  qNum("What is Q1?",6,0.01,"Position (9−1)×0.25 = 2, the third value: 6."),
  qNum("What is Q3?",10,0.01,"Position (9−1)×0.75 = 6, the seventh value: 10."),
  qNum("What is the IQR?",4,0.01,"IQR = Q3 − Q1 = 10 − 6 = 4."),
  qNum("What is the upper fence (Q3 + 1.5×IQR)?",16,0.01,"10 + 1.5 × 4 = 16."),
  qSingle("Which value is an outlier, and what should you do first?",["40: investigate whether it is an error or a real slow response","11: delete it immediately","4: it is too small","No outliers exist"],0,"40 is above the fence of 16. Investigate before removing."),
  qWritten("Why is investigating an outlier better than deleting it automatically?","An outlier may be a data-entry error (fix or remove it) or a rare but real event (keep it, because deleting it hides important information). Understand the cause first.")],
 solution:sol(["One extreme value."],["IQR outlier rule."],["Q1 6, Q3 10, IQR 4, fence 16; 40 is an outlier."],["Investigate; fix, cap or keep with a reason."],"Outliers need judgement, not automatic deletion.",["Deleting without checking."])},

{id:"c4-encoding",title:"Turning categories into numbers",chapter:4,category:"choose",difficulty:"medium",minutes:8,
 tags:["encoding"],related:["c4-5"],
 description:"A model needs numbers, but the dataset has text columns. The analyst must decide how to encode each column.",
 hint:"If the categories have a natural order, label encoding is fine. If not, use one-hot encoding.",
 questions:[
  qMatch("Choose the encoding method.",["Label encoding (ordered numbers)","One-hot encoding (0/1 columns)"],[["T-shirt size: small, medium, large (has an order)",0],["City: Lahore, Karachi, Islamabad (no order)",1],["Satisfaction: low, medium, high (has an order)",0],["Product colour: red, green, blue (no order)",1]],"Ordinal data suits label encoding; nominal data suits one-hot encoding so no false order is introduced."),
  withCode(qSingle("What does this print?",["['Karachi', 'Lahore']","['Lahore', 'Karachi']","[0, 1]","['city']"],0,"get_dummies makes one column per category, in alphabetical order."),"import pandas as pd\ndf = pd.DataFrame({\"city\": [\"Lahore\", \"Karachi\", \"Lahore\"]})\nprint(pd.get_dummies(df[\"city\"], dtype=int).columns.tolist())"),
  qSingle("Why is label encoding risky for a nominal column like city?",["The numbers imply an order or size that does not exist","It deletes rows","It makes the file larger","It removes the column"],0,"Lahore = 0, Karachi = 1, Islamabad = 2 would suggest Islamabad is ‘bigger’.")],
 solution:sol(["Text categories must become numbers."],["Label vs one-hot encoding."],["Ordinal → label; nominal → one-hot."],["Use pd.get_dummies for nominal columns."],"Choose the encoding to match the variable type.",["Label-encoding a nominal variable."])},

{id:"c4-variable-types",title:"What kind of variable is it?",chapter:4,category:"identify",difficulty:"medium",minutes:8,
 tags:["stattypes","encoding"],related:["c4-5"],
 description:"A survey of students records: city, T-shirt size (S, M, L, XL), number of siblings, height in cm, and whether they own a laptop (yes/no).",
 hint:"Order matters for ordinal; counting gives discrete; measuring gives continuous.",
 questions:[
  qMatch("Classify each variable.",["Nominal","Ordinal","Discrete numerical","Continuous numerical","Boolean"],[["City",0],["T-shirt size (S, M, L, XL)",1],["Number of siblings",2],["Height in cm",3],["Owns a laptop (yes/no)",4]],"Nominal: labels without order. Ordinal: meaningful order. Discrete: counted. Continuous: measured. Boolean: true/false."),
  qSingle("What is the difference between nominal and ordinal data?",["Ordinal has a meaningful order; nominal does not","Nominal is numerical; ordinal is text","They are the same","Ordinal cannot be categorical"],0,"Exam focus: nominal has no natural order; ordinal has a meaningful order.")],
 solution:sol(["Mixed variable types."],["Categorical vs numerical; nominal vs ordinal."],["Decide order and counting/measuring."],["Pick encodings and charts that suit each type."],"Variable type controls which statistics, encodings and charts make sense.",["Treating ordinal as if it had equal spacing."])},

{id:"c4-scaling",title:"Put the numbers on the same scale",chapter:4,category:"apply",difficulty:"medium",minutes:10,
 tags:["scaling"],related:["c4-6"],
 description:"A model uses two features: age (20 to 100) and salary (in lakhs). Because the values are on very different scales, the analyst scales the ages: 20, 30, 40, 50, 100. For these ages the mean is 48 and the population standard deviation is about 27.86.",
 chart:{type:"bars",title:"Original ages",items:[["20",20],["30",30],["40",40],["50",50],["100",100]]},
 hint:"Min-max: (x − min) / (max − min). z-score: (x − mean) / SD.",
 questions:[
  qNum("Min-max scale the age 40 (give the value between 0 and 1).",0.25,0.005,"(40 − 20) / (100 − 20) = 20 / 80 = 0.25."),
  qNum("Standardise the age 100 (z-score, 2 decimals).",1.87,0.01,"(100 − 48) / 27.86 = 1.87."),
  qSingle("After min-max scaling, all values lie between:",["0 and 1","−1 and 1","0 and 100","The mean and the SD"],0,"The smallest value becomes 0 and the largest becomes 1."),
  qSingle("When should the min, max, mean and SD be learned?",["From the training data only, then applied to test data","From the whole dataset before splitting","From the test data only","They are never needed"],0,"Learning them from all the data leaks information from the test set.")],
 solution:sol(["Features on different scales."],["Min-max normalisation and standardisation."],["Min-max 0.25; z = 1.87."],["Fit the scaler on training data only."],"Scaling puts features on comparable scales.",["Scaling before splitting the data."])},

/* ============ TOPIC 5 / WEEK 5: Pandas & Data Manipulation ============ */
{id:"c5-operations",title:"Which Pandas operation?",chapter:5,category:"choose",difficulty:"easy",minutes:8,
 tags:["pandas-ops"],related:["c5-2","c5-3","c5-4","c5-5"],
 description:"An analyst has a DataFrame of students and needs to do seven different jobs with it.",
 hint:"Match the verb: look, filter, sort, group, join, count missing, remove repeats.",
 questions:[
  qMatch("Pick the best operation for each job.",["df.head() / df.info()","df[df[\"marks\"] > 70]","df.sort_values(\"marks\")","df.groupby(\"city\")[\"marks\"].mean()","df.merge(other, on=\"city\")","df.isnull().sum()","df.drop_duplicates()"],[["Look at the first rows and the column types",0],["Keep only students scoring above 70",1],["Order students from lowest to highest marks",2],["Find the average marks for each city",3],["Add each city's province from a second table",4],["Count missing values in every column",5],["Remove repeated rows",6]],"Inspect (head/info), filter (condition), sort_values, groupby + aggregation, merge, isnull, drop_duplicates.")],
 solution:sol(["Seven data tasks."],["Pandas operations."],["Match the task to the method."],["Practise each in the Pandas explorer lab."],"Pandas offers one clear operation for each common job.",["Using a loop when a Pandas method exists."])},

{id:"c5-groupby",title:"Group and average",chapter:5,category:"apply",difficulty:"medium",minutes:9,
 tags:["groupby"],related:["c5-4"],
 description:"A DataFrame has five students: Lahore 78, Karachi 91, Lahore 72, Karachi 85, Islamabad 60 (city, marks). The analyst runs df.groupby(\"city\")[\"marks\"].mean().",
 hint:"Split the rows by city first, then average each group.",
 questions:[
  qNum("What is the mean marks for Lahore?",75,0.01,"(78 + 72) / 2 = 75."),
  qNum("What is the mean marks for Karachi?",88,0.01,"(91 + 85) / 2 = 88."),
  qNum("How many groups (rows) does the result contain?",3,0.01,"One row per distinct city: Islamabad, Karachi, Lahore."),
  qSingle("In which order are the group keys returned by default?",["Sorted by key (Islamabad, Karachi, Lahore)","In order of first appearance","Random order","Largest mean first"],0,"groupby sorts the group keys by default."),
  qSingle("Which three steps does groupby follow?",["Split into groups, apply a function, combine the results","Sort, delete, save","Read, write, close","Filter, merge, plot"],0,"Split → apply → combine.")],
 solution:sol(["Average per group."],["groupby and aggregation."],["Lahore 75, Karachi 88, Islamabad 60."],["Use .agg() for several statistics at once."],"groupby splits, aggregates and combines.",["Averaging all rows instead of per group."])},

{id:"c5-merge",title:"Combining two tables",chapter:5,category:"choose",difficulty:"medium",minutes:8,
 tags:["merge"],related:["c5-5"],
 description:"One table lists students and their city. A second table lists each city's province. A third, older table lists students who have left. The analyst must combine tables correctly.",
 hint:"A merge needs a key column that appears in both tables.",
 questions:[
  withCode(qSingle("What does this print?",["['Punjab', 'Sindh']","['Lahore', 'Karachi']","[75, 91]","['province']"],0,"merge joins on city and brings in the province column."),"import pandas as pd\na = pd.DataFrame({\"city\": [\"Lahore\", \"Karachi\"], \"marks\": [75, 91]})\nb = pd.DataFrame({\"city\": [\"Lahore\", \"Karachi\"], \"province\": [\"Punjab\", \"Sindh\"]})\nprint(a.merge(b, on=\"city\")[\"province\"].tolist())"),
  qMatch("Match each join type to what it keeps.",["inner","left","outer"],[["Only rows whose key appears in both tables",0],["All rows from the left table, matched rows from the right",1],["All rows from both tables",2]],"inner = intersection; left = keep every left row; outer = union."),
  qSingle("What is the difference between merge and join in Pandas?",["merge combines on columns/keys; join aligns on the index by default","They are exactly the same","join only works on text","merge deletes data"],0,"Both support several join approaches; they differ in the default key.")],
 solution:sol(["Two tables share a key."],["merge, join types."],["Join on city with an inner merge."],["Check the key and the join type."],"Merging combines tables through a shared key.",["Merging on the wrong column."])},

{id:"c5-pipeline-words",title:"Acquisition, cleaning, manipulation, visualization",chapter:5,category:"identify",difficulty:"easy",minutes:6,
 tags:["manipulation","pipeline"],related:["c5-6"],
 description:"The notes summarise four data-handling activities. Classify each action.",
 questions:[
  qMatch("Which activity is it?",["Acquisition","Cleaning","Manipulation","Visualization"],[["Download a CSV from a survey tool",0],["Remove repeated rows and fix wrong formats",1],["Group by city and compute the average marks",2],["Draw a bar chart of average marks per city",3],["Merge two tables on student ID",2],["Fix an impossible age value",1]],"Acquisition = obtain; cleaning = fix quality problems; manipulation = transform/organise; visualization = communicate patterns.")],
 solution:sol(["Four data activities."],["Acquisition, cleaning, manipulation, visualization."],["Classify the action."],["Follow the order in projects."],"Each activity has its own purpose.",["Calling merging ‘cleaning’."])},

/* ============ TOPIC 6 / WEEK 6: EDA ============ */
{id:"c6-uni-bi-multi",title:"Univariate, bivariate or multivariate?",chapter:6,category:"identify",difficulty:"easy",minutes:6,
 tags:["eda-types"],related:["c6-2"],
 description:"An analyst explores a student dataset with columns: marks, attendance, study_hours and sleep_hours, using many different analyses.",
 hint:"Count how many variables are examined together: one, two, or three or more.",
 questions:[
  qMatch("Classify each analysis.",["Univariate (one variable)","Bivariate (two variables)","Multivariate (three or more)"],[["A histogram of marks",0],["A scatter plot of study hours against marks",1],["The mean and median of attendance",0],["A heatmap of correlations between marks, attendance, study hours and sleep",2],["The correlation between sleep hours and marks",1]],"Univariate looks at one variable, bivariate at two, multivariate at three or more together.")],
 solution:sol(["Different kinds of EDA."],["Univariate, bivariate, multivariate analysis."],["Count the variables."],["Start univariate, then compare pairs, then look at many."],"The number of variables decides the type of analysis.",["Calling a scatter plot univariate."])},

{id:"c6-mean-median",title:"The salary outlier",chapter:6,category:"apply",difficulty:"easy",minutes:8,
 tags:["descriptive"],related:["c6-3","c6-4"],
 description:"A small company lists monthly salaries (in thousands of rupees) of seven employees. One is the owner's salary.",
 chart:{type:"bars",title:"Salaries (thousand Rs)",items:[["E1",30],["E2",32],["E3",35],["E4",36],["E5",38],["E6",40],["Owner",400]]},
 hint:"Mean = sum / count. Median = middle value after sorting.",
 questions:[
  qNum("Calculate the mean salary (thousand Rs, 1 decimal place).",87.29,0.1,"Sum = 30+32+35+36+38+40+400 = 611; 611 / 7 = 87.29."),
  qNum("What is the median salary (thousand Rs)?",36,0.01,"Sorted values: the 4th of 7 is 36."),
  qSingle("Which is a better summary of a ‘typical’ salary here?",["Median, because it is robust to the extreme value","Mean, because it uses all values","Mode, because there is one","Range"],0,"Exam focus: the mean is sensitive to extreme values; the median is more robust."),
  qWritten("Explain what the outlier does to the mean and median.","The outlier (400) pulls the mean up to about 87, far above what most employees earn, while the median stays at 36 because it depends only on the middle position.")],
 solution:sol(["One extreme salary distorts the average."],["Mean vs median."],["Mean = 611/7; median = middle of sorted list."],["Report the median (and look at the outlier)."],"Median resists outliers, mean does not.",["Reporting the mean for skewed data."])},

{id:"c6-variance",title:"Spread of exam marks",chapter:6,category:"apply",difficulty:"medium",minutes:10,
 tags:["descriptive","spread"],related:["c6-3","c6-4"],
 description:"Eight students scored: 2, 4, 4, 4, 5, 5, 7, 9 in a short quiz. Use the lecture definitions: variance is the average of squared deviations from the mean (population version).",
 chart:{type:"hist",title:"Quiz scores",values:[2,4,4,4,5,5,7,9],bins:4,xlabel:"score",mean:5,median:4.5},
 hint:"First the mean, then each (value − mean)², average them; std dev = √variance.",
 questions:[
  qNum("What is the mean?",5,0.01,"Sum = 40, count = 8, mean = 5."),
  qNum("What is the (population) variance?",4,0.01,"Squared deviations: 9,1,1,1,0,0,4,16 = 32; 32 / 8 = 4."),
  qNum("What is the standard deviation?",2,0.01,"√4 = 2."),
  qNum("What is the range?",7,0.01,"max − min = 9 − 2 = 7."),
  qSingle("If all eight scores were 5, the standard deviation would be:",["0","5","1","4"],0,"No spread at all means zero variance and zero standard deviation.")],
 solution:sol(["Need to describe how spread out scores are."],["Mean, variance, standard deviation, range."],["Mean 5; variance 4; sd 2; range 7."],["Report mean and spread together."],"Standard deviation is the square root of variance and measures spread around the mean.",["Forgetting to square the deviations."])},

{id:"c6-heatmap",title:"Reading a correlation heatmap",chapter:6,category:"interpret",difficulty:"medium",minutes:9,
 tags:["correlation-heat"],related:["c6-5","c7-3"],
 description:"An analyst computed the correlation between four student variables (10 students) and drew a heatmap. Red is positive correlation, blue is negative, and the number is r.",
 chart:{type:"heat",title:"Correlation matrix",labels:["Study hrs","Attendance","Marks","Sleep"],matrix:[[1,0.97,0.98,-0.78],[0.97,1,0.97,-0.77],[0.98,0.97,1,-0.74],[-0.78,-0.77,-0.74,1]]},
 hint:"Look for the number closest to +1 or −1.",
 questions:[
  qSingle("Which pair is most strongly positively correlated?",["Study hours and marks (0.98)","Sleep and marks (−0.74)","Sleep and attendance (−0.77)","Every pair equally"],0,"0.98 is the closest to +1."),
  qSingle("What does r = −0.74 between sleep and marks mean?",["As sleep rises, marks tend to fall: a fairly strong negative association","Sleep causes lower marks","There is no relationship","Marks are perfectly predicted by sleep"],0,"Negative sign = opposite direction. It does not prove cause."),
  qNum("What number appears on the diagonal (each variable with itself)?",1,0.001,"A variable is perfectly correlated with itself: r = 1."),
  qSingle("Does the strong correlation show that more study hours cause higher marks?",["No: correlation shows association, not cause by itself","Yes, always","Yes, because r > 0.9","Only if r is negative"],0,"Other factors could be involved. Correlation alone does not prove causation.")],
 solution:sol(["Interpreting a correlation heatmap."],["Correlation, heatmap."],["Read signs and sizes of r."],["Check promising pairs with scatter plots."],"A heatmap summarises many correlations at once.",["Reading correlation as causation."])},

{id:"c6-ice-cream",title:"Ice cream and drowning",chapter:6,category:"interpret",difficulty:"easy",minutes:6,
 tags:["correlation"],related:["c6-5"],
 description:"A city's monthly data shows ice-cream sales and drowning accidents rising and falling together. The correlation coefficient is r = +0.9. A councillor proposes banning ice cream to save lives.",
 chart:{type:"scatter",title:"Ice-cream sales vs drownings (monthly)",xlabel:"ice-cream sales",ylabel:"drownings",points:[[10,1],[14,2],[18,2],[25,4],[30,5],[38,6],[45,8],[52,8],[60,10]]},
 hint:"What could cause both to rise at the same time?",
 questions:[
  qSingle("What does r = +0.9 tell us?",["A strong positive association","That ice cream causes drowning","No relationship","A weak negative association"],0,"r near +1 = strong positive association; it does not show causation."),
  qSingle("What is the most likely explanation?",["Hot weather increases both swimming and ice-cream buying","Ice cream makes people unable to swim","Drowning makes people buy ice cream","Pure coincidence is impossible"],0,"A third variable (hot weather) drives both."),
  qSingle("The councillor's proposal is based on:",["Confusing correlation with causation","A valid causal experiment","A negative correlation","A perfect model"],0,"Correlation alone does not prove causation.")],
 solution:sol(["Two variables move together."],["Correlation vs causation; confounding."],["A third factor (heat) explains both."],["Look for causal evidence before acting."],"Correlation measures association, not cause.",["Acting on correlation alone."])},

/* ============ TOPIC 7 / WEEK 7: Data Visualization ============ */
{id:"c7-chart-choice",title:"Choosing the right chart",chapter:7,category:"choose",difficulty:"medium",minutes:8,
 tags:["visualization"],related:["c7-2"],
 description:"An analyst needs to answer six different questions with charts.",
 hint:"Choose the chart according to the question being answered.",
 questions:[
  qMatch("Pick the best chart.",["Bar chart","Line chart","Pie chart","Histogram","Scatter plot","Box plot"],[["Compare sales across product categories",0],["Show monthly revenue over a year",1],["Show market share of 3 companies",2],["Show the distribution of student ages",3],["Study hours vs marks",4],["Spread and outliers of salaries",5]],"Bar: categories. Line: trends over time. Pie: simple part-to-whole. Histogram: distribution. Scatter: relationship. Box: spread/outliers.")],
 solution:sol(["Six questions, six charts."],["Chart selection."],["Match purpose to chart."],["Label axes and titles."],"The question decides the chart.",["Using a pie chart for many categories."])},

{id:"c7-library-calls",title:"Which plotting call?",chapter:7,category:"identify",difficulty:"easy",minutes:6,
 tags:["plot-calls"],related:["c7-1","c7-3"],
 description:"A student writes plotting code with Matplotlib and Seaborn and needs to know what each call draws.",
 hint:"hist = histogram, scatter = scatter plot, bar = bar chart, plot = line, heatmap = coloured grid, boxplot = box plot.",
 questions:[
  qMatch("What does each call draw?",["Histogram","Scatter plot","Bar chart","Line chart","Heatmap","Box plot"],[["plt.hist(ages)",0],["plt.scatter(hours, marks)",1],["plt.bar(names, sales)",2],["plt.plot(months, revenue)",3],["sns.heatmap(df.corr(), annot=True)",4],["sns.boxplot(x=salaries)",5]],"hist → histogram, scatter → scatter plot, bar → bar chart, plot → line, heatmap → colour grid, boxplot → box plot."),
  qSingle("Which Python library offers sns.heatmap() and sns.boxplot()?",["Seaborn","NumPy","Pandas","Scikit-learn"],0,"Seaborn is built on Matplotlib for statistical charts.")],
 solution:sol(["Plot calls."],["Matplotlib and Seaborn."],["Match call to chart."],["Memorise the main ones."],"Each call draws one chart type.",["Using plt.plot for a histogram."])},

{id:"c7-misleading",title:"A misleading chart",chapter:7,category:"diagnose",difficulty:"medium",minutes:8,
 tags:["principles"],related:["c7-4"],
 description:"A phone shop's bar chart shows ratings of 92, 88, 85 and 82. The y-axis starts at 80 instead of 0, so Phone A's bar looks four times taller than Phone D's. Another slide uses a pie chart with twelve similar slices.",
 chart:{type:"bars",title:"Ratings (axis from 0)",max:100,items:[["Phone A",92],["Phone B",88],["Phone C",85],["Phone D",82]]},
 hint:"Compare the real numbers 92 and 82, not the bar heights.",
 questions:[
  qSingle("What is wrong with the first chart?",["The truncated axis exaggerates the difference","The chart type is a line chart","The numbers are negative","It has too many bars"],0,"Cutting the axis at 80 makes 92 versus 82 look like a huge gap."),
  qNum("How many times larger is 92 than 82 (ratio, 2 decimals)?",1.12,0.01,"92 / 82 = 1.12, only about 12% bigger."),
  qSingle("Why is a twelve-slice pie chart a poor choice?",["Similar slices are hard to compare; a bar chart is clearer","Pie charts cannot show percentages","Pie charts need dates","Twelve is not allowed"],0,"Pie charts work for a few parts of a whole."),
  qMulti("Select ALL good visualization practices.",["Give the chart a clear title","Label the axes","Add a legend when several series are shown","Use as many decorative colours as possible"],[0,1,2],"Titles, axis labels and legends help readers; random colour does not.")],
 solution:sol(["Misleading axis and a cluttered pie."],["Visualization principles."],["Axis from 0; fewer slices."],["Redraw as a bar chart with a full axis."],"Honest charts help people decide correctly.",["Truncating the axis to dramatise a difference."])},

/* ============ TOPIC 8 / WEEK 10: Machine Learning Fundamentals ============ */
{id:"c8-learning-types",title:"Supervised, unsupervised or reinforcement?",chapter:8,category:"identify",difficulty:"easy",minutes:7,
 tags:["ml-types"],related:["c8-2"],
 description:"A company uses machine learning in four projects. Each project has different data.",
 hint:"Labeled data → supervised. No labels, find groups → unsupervised. Learn by reward → reinforcement.",
 questions:[
  qMatch("Which type of learning is each project?",["Supervised learning","Unsupervised learning","Reinforcement learning"],[["Detect spam using emails already labelled spam / not spam",0],["Predict house prices from past sales with known prices",0],["Group customers by buying behaviour when no groups are given",1],["A robot learns to walk by getting rewards for good moves",2]],"Supervised: labeled examples. Unsupervised: finds structure without labels. Reinforcement: learns by trial and reward."),
  qSingle("What is the key difference between supervised and unsupervised learning?",["Supervised data has known labels (targets); unsupervised data does not","Unsupervised learning needs more labels","Supervised learning never uses data","There is no difference"],0,"Labeled vs unlabeled data.")],
 solution:sol(["Four ML projects."],["Supervised, unsupervised, reinforcement."],["Labeled / unlabeled / reward."],["Choose the type from the data you have."],"The type of learning depends on whether labels exist.",["Calling clustering supervised."])},

{id:"c8-class-reg",title:"Classification or regression?",chapter:8,category:"choose",difficulty:"easy",minutes:7,
 tags:["class-reg"],related:["c8-3"],
 description:"Supervised learning predicts a target. Is the target a category or a number?",
 hint:"Category → classification. Continuous number → regression. No target at all → clustering (unsupervised).",
 questions:[
  qMatch("Choose the task type.",["Classification (predict a category)","Regression (predict a number)","Clustering (no labels)"],[["Predict whether an email is spam or not spam",0],["Predict the selling price of a house in rupees",1],["Predict a student's final marks out of 100",1],["Group customers into similar segments without labels",2],["Predict whether a loan is approved or rejected",0]],"Classification predicts categories; regression predicts continuous numbers; clustering groups unlabeled data.")],
 solution:sol(["Task type identification."],["Classification vs regression."],["Look at the type of output."],["Use the right type of model."],"The target decides the task.",["Using regression for categories."])},

{id:"c8-split-calc",title:"How many rows go where?",chapter:8,category:"apply",difficulty:"easy",minutes:6,
 tags:["split"],related:["c8-4"],
 description:"A dataset has 1,000 rows. The team splits it 70% training, 15% validation and 15% test.",
 hint:"Multiply the total by each percentage.",
 questions:[
  qNum("How many rows are used for training?",700,0.1,"1,000 × 0.70 = 700."),
  qNum("How many rows are in the validation set?",150,0.1,"1,000 × 0.15 = 150."),
  qNum("How many rows are in the test set?",150,0.1,"1,000 × 0.15 = 150."),
  qSingle("Which set should be used only once, at the very end?",["Test set","Training set","Validation set","All of them equally"],0,"The test set gives one honest final check on unseen data.")],
 solution:sol(["Counting rows in a split."],["Train/validation/test split."],["700 / 150 / 150."],["Keep the test set untouched."],"Each set has a different purpose.",["Tuning the model on the test set."])},

{id:"c8-leakage",title:"Spot the data leakage",chapter:8,category:"diagnose",difficulty:"hard",minutes:11,
 tags:["split","leakage"],related:["c8-4"],
 description:"Three students built models. Student A scaled all the data first and then split it. Student B tried 20 settings and kept the one with the best score on the TEST set. Student C learned scaling values from the training data only and used the test set once at the end.",
 hint:"Ask: did information from the test set influence training or tuning?",
 questions:[
  qMatch("Which student's approach is leaky?",["Leaky (test information used)","Not leaky"],[["A: scaled all the data, then split it",0],["B: picked the best settings using test-set scores",0],["C: scaling learned from training data, test used once",1]],"Scaling on all data lets test information influence training; tuning on the test set makes the test score over-optimistic."),
  qSingle("Which dataset should B have used to compare the 20 settings?",["A validation set (or cross-validation)","The test set again","The training score only","None"],0,"Tune on validation data; keep the test set for the final check."),
  qWritten("Explain why data leakage makes a model look better than it really is.","If information from the test data influences training or tuning, the test score no longer measures performance on truly unseen data. The model seems better than it will be after deployment. Learn scaling and imputation values from training data only and use the test set once.")],
 solution:sol(["Leakage through scaling and tuning."],["Train/validation/test discipline."],["A and B leak; C does not."],["Fit transformers on training data; tune on validation."],"The test set must stay unseen until the end.",["Tuning on the test set."])},

{id:"c8-diagnose-numbers",title:"Diagnose from accuracies",chapter:8,category:"diagnose",difficulty:"easy",minutes:6,
 tags:["fitting","underfit","overfit"],related:["c8-8"],
 description:"A student trained four models and wrote down training and test accuracy. Use the notes' quick diagnosis: both low = underfitting; very high train but much lower test (large gap) = overfitting; both high and close = good fit.",
 hint:"Look at both numbers and the gap between them.",
 questions:[
  qMatch("Diagnose each model.",["Underfitting","Overfitting","Good fit"],[["Train 58%, Test 55%",0],["Train 98%, Test 70%",1],["Train 90%, Test 88%",2],["Train 99%, Test 97%",2]],"Underfitting: both low. Overfitting: large gap, train ≫ test. Good fit: both high and close."),
  qSingle("A model that performs well on training data but poorly on new data is:",["Overfitted","Underfitted","Well generalised","Unbiased"],0,"It memorised the training data including its noise.")],
 solution:sol(["Interpret train/test accuracies."],["Under/overfitting, generalisation."],["Compare level and gap."],["Fix according to the diagnosis."],"Generalisation means performing well on unseen data.",["Judging a model from training accuracy only."])},

{id:"c8-complexity-curve",title:"Choosing model complexity",chapter:8,category:"interpret",difficulty:"medium",minutes:10,
 tags:["fitting","overfit","underfit"],related:["c8-7","c8-8"],
 description:"A student trains polynomial models of increasing degree (1 = simple, 8 = very complex) and records the error on training data and on test data (lower is better).",
 chart:{type:"lines",title:"Error vs model complexity",xlabel:"polynomial degree",ylabel:"error",xticks:7,xmin:1,xmax:8,ymin:0,ymax:1.2,series:[{name:"Training error",pts:[[1,0.9],[2,0.5],[3,0.3],[4,0.2],[5,0.12],[6,0.07],[7,0.04],[8,0.02]]},{name:"Test error",pts:[[1,0.95],[2,0.55],[3,0.35],[4,0.3],[5,0.36],[6,0.5],[7,0.75],[8,1.1]]}]},
 hint:"The best model has the lowest TEST error, not the lowest training error.",
 questions:[
  qSingle("At degree 1 the model is:",["Underfitting","Overfitting","A good fit","Perfect"],0,"Both errors are high: too simple."),
  qSingle("At degree 8 the model is:",["Overfitting","Underfitting","A good fit","Unbiased"],0,"Training error is tiny but test error is high: large gap."),
  qNum("Which degree has the lowest test error?",4,0.01,"Test error is lowest (0.30) at degree 4."),
  qSingle("Why can’t we choose the model with the lowest training error?",["It may just have memorised the training data","Training error is always zero","Test error is meaningless","Higher degree is always worse"],0,"Training error keeps falling as complexity grows even when the model stops generalising.")],
 solution:sol(["Reading train and test curves."],["U-shaped test error; under/overfitting."],["Lowest test error at degree 4."],["Pick degree 4 (or use cross-validation)."],"Generalisation is judged on unseen data.",["Choosing by training error."])},

{id:"c8-fix-it",title:"Pick the right fix",chapter:8,category:"choose",difficulty:"medium",minutes:9,
 tags:["fitting","fixes"],related:["c8-8"],
 description:"Three project teams report problems. Choose a suitable first fix for each.",
 hint:"Underfitting needs more capacity; overfitting needs less complexity or more data.",
 questions:[
  qMatch("Choose the best first fix.",["Increase model complexity or add useful features","Simplify the model / regularise / get more data","Nothing: it is a good fit"],[["Train accuracy 55%, test accuracy 54%, only two features used",0],["Train accuracy 99%, test accuracy 65%, dataset of only 80 rows",1],["Train accuracy 91%, test accuracy 89%",2]],"Both low → underfitting → add capacity/features. Large gap → overfitting → simplify, regularise, add data. Both high and close → good fit."),
  qMulti("Select ALL remedies that help against OVERFITTING.",["Regularisation","Cross-validation","Early stopping / pruning","Remove all features"],[0,1,2],"Removing all features would cause underfitting.")],
 solution:sol(["Three diagnoses."],["Fixes for under/overfitting."],["Match fix to diagnosis."],["Re-test after each change."],"Different problems need different remedies.",["Making an overfitted model even more complex."])},

{id:"c8-analogy",title:"The student analogy",chapter:8,category:"identify",difficulty:"easy",minutes:5,
 tags:["fitting"],related:["c8-7"],
 description:"A teacher explains over/underfitting with three students who prepared for an exam in different ways.",
 questions:[
  qMatch("Match each student to the fitting concept.",["Underfitting","Overfitting","Good fit"],[["Barely studied, fails old and new questions",0],["Memorised last year's paper word for word",1],["Understands the concepts and can solve any new question",2]],"This is the analogy from the notes.")],
 solution:sol(["Intuition for generalisation."],["Under/overfitting analogy."],["Match behaviour to concept."],["Aim for understanding, not memorising."],"A good model generalises like a student who understood the concepts.",["Thinking the memoriser is the best student."])}
];

/* finalise: stable question ids, published flag */
SCENARIOS.forEach(s=>{s.published=s.published!==false;s.questions.forEach((q,i)=>{q.id="q"+(i+1)})});
