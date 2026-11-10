/* Scenario content (data only). The UI lives in scenarios.js.
   Question types: single, multi (select all, partial credit), match (classify items), number (calculation), written (self-assessed).
   Optional fields: chart (drawn by charts.js), code (shown as a code block), hint (guided mode).
   Content follows the student's handwritten notes and the exam-preparation notes in this repo. */
const qSingle=(prompt,options,a,explain)=>({type:"single",prompt,options,answer:[a],explain,marks:1});
const qMulti=(prompt,options,a,explain)=>({type:"multi",prompt,options,answer:a,explain,marks:2});
const qMatch=(prompt,categories,items,explain)=>({type:"match",prompt,categories,items:items.map(([t,a])=>({t,a})),explain,marks:items.length});
const qNum=(prompt,answer,tol,explain)=>({type:"number",prompt,answer,tol,explain,marks:1});
const qWritten=(prompt,model)=>({type:"written",prompt,model,marks:0});
const sol=(problem,concepts,apply,recs,just,mistakes)=>({problem,concepts,apply,recs,just,mistakes});

const SCENARIOS=[
/* ============ TOPIC 1: Data Science and lifecycle ============ */
{id:"c1-student-fail",title:"Predicting which students will fail",chapter:1,category:"identify",difficulty:"easy",minutes:6,
 tags:["lifecycle"],related:["c1-2"],
 description:"A university wants to warn students who may fail the course. It has attendance sheets, assignment marks and last year's results stored in different systems. The team lead says: “Before touching any data, let's agree on what exactly we are trying to predict and how we will know it works.”",
 hint:"Which lifecycle step is about understanding what to solve?",
 questions:[
  qSingle("Which lifecycle step is the team lead describing?",["Problem definition","Model evaluation","Deployment","Data cleaning"],0,"Problem definition: first understand what must be solved, including the target and success criteria."),
  qMatch("Match each activity to its lifecycle stage.",["Problem definition","Data collection","Data cleaning","EDA","Model building"],[["Decide the goal: predict who will fail",0],["Gather attendance and marks from the university systems",1],["Fix missing attendance values and duplicates",2],["Plot marks against attendance to find patterns",3],["Train a model on past results",4]],"Follow the order: define → collect → clean → explore → model.")],
 solution:sol(["The team needs to turn a vague worry into a clear prediction task."],["Data Science lifecycle: problem definition first."],["Goal and success criteria are agreed before any data work."],["Then collect, clean, explore, model, evaluate, deploy, monitor."],"The lifecycle starts with understanding the problem; wrong problem = wasted effort.",["Jumping straight to modelling.","Skipping the success criteria."])},

{id:"c1-skipped-eval",title:"The model that got worse after launch",chapter:1,category:"diagnose",difficulty:"medium",minutes:9,
 tags:["lifecycle","evaluation"],related:["c1-2"],
 description:"A shop trained a sales-prediction model and deployed it straight away because it ‘looked good’ on the data it was trained on. Six months later, predictions are often wrong because customer behaviour has changed. Nobody has checked the model since launch.",
 hint:"Two lifecycle steps are missing or neglected here.",
 questions:[
  qSingle("Which step should have happened BEFORE deployment?",["Model evaluation on unseen data","Problem definition","Data acquisition","Another round of training on the same data"],0,"Evaluation tests the model on unseen rows to check it generalises."),
  qSingle("Which step was neglected AFTER deployment?",["Monitoring and maintenance","Data cleaning","EDA","Feature scaling"],0,"Monitoring tracks performance, data drift and retraining needs."),
  qMulti("Select ALL things monitoring would track.",["Model performance over time","Data drift","Errors","The colour of the dashboard"],[0,1,2],"Colours are irrelevant; performance, drift and errors matter."),
  qWritten("Explain why a model that looks good on training data can still fail, and which two lifecycle steps prevent this.","A model can memorise training data and fail on unseen data, so it must be evaluated on unseen rows before deployment. After deployment, the world changes (data drift), so the model must be monitored and retrained when needed.")],
 solution:sol(["Evaluation skipped; no monitoring."],["Evaluation (unseen data) and monitoring and maintenance."],["Training performance is not proof of real performance."],["Hold out test data; monitor performance and drift after launch."],"Deployment is not the end of the lifecycle.",["Treating deployment as the final step."])},

{id:"c1-what-is-ds",title:"What goes into Data Science?",chapter:1,category:"identify",difficulty:"easy",minutes:5,
 tags:["definition"],related:["c1-1"],
 description:"A friend asks: “Is Data Science just programming?” You explain that it uses data to produce useful insights, and that it mixes several kinds of knowledge.",
 questions:[
  qMulti("According to the notes, which three kinds of knowledge are mixed in Data Science?",["Statistics","Programming","Domain knowledge","Graphic design"],[0,1,2],"Statistics, programming and domain knowledge."),
  qSingle("Data Science is best described as:",["Extracting useful insights from raw data","Only storing data in databases","Only drawing charts","Only building websites"],0,"The aim is turning raw data into insight and knowledge.")],
 solution:sol(["Common misunderstanding that DS = coding."],["Definition of Data Science."],["Statistics + programming + domain knowledge → insights from raw data."],["Explain with an example such as predicting student performance."],"Data Science is interdisciplinary.",["Reducing it to one skill."])},

/* ============ TOPIC 2: Roles ============ */
{id:"c2-who-does-what",title:"Who does which job?",chapter:2,category:"identify",difficulty:"easy",minutes:6,
 tags:["roles"],related:["c2-1","c2-2"],
 description:"A company has a data team. Four tasks arrive on Monday morning and the manager must decide who handles each.",
 hint:"Think: pipelines → engineer, reports → analyst, models → scientist, production → ML engineer.",
 questions:[
  qMatch("Assign each task to the best-suited role.",["Data Scientist","Data Analyst","Data Engineer","Machine Learning Engineer"],[["Build Spark/Kafka pipelines that move data into the warehouse",2],["Create a Tableau dashboard of monthly sales",1],["Build a statistical model in Python to predict churn",0],["Deploy the churn model to production using Docker",3]],"Engineer = pipelines; analyst = reporting and visualisation; scientist = modelling and statistics; ML engineer = deploying models."),
  qSingle("Which role focuses strongly on reporting and descriptive analysis?",["Data Analyst","Data Engineer","ML Engineer","Data Architect"],0,"Exam focus: analysts report and visualise.")],
 solution:sol(["Four tasks, four roles."],["Data Scientist, Analyst, Engineer, ML Engineer."],["Match by main responsibility and typical tools."],["Clarify ownership early."],"Roles overlap, but each has a main responsibility.",["Calling every data job ‘data scientist’."])},

{id:"c2-startup-hire",title:"The startup's first data hire",chapter:2,category:"choose",difficulty:"medium",minutes:9,
 tags:["roles"],related:["c2-1","c2-2"],
 description:"A delivery startup logs orders in several apps, spreadsheets and a small database. Data is scattered, delayed and often broken. The founders can afford one data hire now. They want reliable, up-to-date data first; fancy predictions can wait.",
 hint:"What is the main blocker: modelling or data flow?",
 questions:[
  qSingle("Who should be hired first?",["Data Engineer","Data Scientist","Machine Learning Engineer","Business presenter only"],0,"The main problem is getting data into reliable pipelines. Engineers build the infrastructure."),
  qSingle("Later, who would build dashboards for the founders?",["Data Analyst","Data Engineer","Data Architect","No one"],0,"Analysts focus on reporting and visualisation."),
  qWritten("Justify your hiring order for the first three data roles.","Data Engineer first (pipelines and reliable data), then Data Analyst (reports and dashboards), then Data Scientist and ML Engineer when there is clean data and a prediction problem to solve and deploy.")],
 solution:sol(["Scattered, unreliable data."],["Role responsibilities."],["Pipelines before models."],["Hire engineer → analyst → scientist/ML engineer."],"Models cannot succeed without dependable data.",["Hiring a scientist before data is accessible."])},

/* ============ TOPIC 3: Big data ============ */
{id:"c3-five-vs",title:"Match the situation to the V",chapter:3,category:"identify",difficulty:"easy",minutes:6,
 tags:["bigdata"],related:["c3-2"],
 description:"A data team describes five different challenges it faces.",
 hint:"Volume = how much, Velocity = how fast, Variety = how many forms, Veracity = how trustworthy, Value = how useful.",
 questions:[
  qMatch("Which of the 5 Vs does each situation describe?",["Volume","Velocity","Variety","Veracity","Value"],[["Storing petabytes of video",0],["Stock prices arriving every millisecond",1],["Data comes as tables, images, text and sensor logs",2],["Fake accounts make some records unreliable",3],["Analysis helped raise sales by 10%",4]],"Memory: how much, how fast, how many forms, how trustworthy, how useful.")],
 solution:sol(["Five different big-data challenges."],["5 Vs of Big Data."],["Match each description to its V."],["Plan storage, streaming, formats, quality and business benefit."],"Big data is not only about size.",["Thinking big data means only large volume."])},

{id:"c3-telecom",title:"Is the telecom data really Big Data?",chapter:3,category:"apply",difficulty:"medium",minutes:9,
 tags:["bigdata"],related:["c3-1","c3-2"],
 description:"A telecom company records 2 billion call events per day, call-centre audio, customer text complaints and network-sensor streams in real time. Some SIM-registration records are duplicated or wrong. Management wants insights that reduce customer churn.",
 hint:"Check each V against a detail in the story.",
 questions:[
  qMulti("Select ALL Vs clearly present in this case.",["Volume (2 billion events/day)","Velocity (real-time sensor streams)","Variety (audio, text, events)","Veracity (duplicated or wrong records)"],[0,1,2,3],"All four are present; Value is the goal (reducing churn)."),
  qSingle("‘Reducing churn’ is which V?",["Value","Volume","Velocity","Variety"],0,"Value is the useful benefit obtained from the data."),
  qSingle("Audio, text and event logs together show which V?",["Variety","Veracity","Value","Velocity"],0,"Different forms of data = variety."),
  qWritten("Explain why traditional tools may struggle with this dataset and which two Vs make it hardest.","Traditional single-machine tools struggle with huge volumes arriving at high velocity and in many formats (variety). Volume and velocity together make storage and processing hard; veracity also reduces trust unless duplicates and wrong records are fixed.")],
 solution:sol(["Large, fast, varied, imperfect data."],["5 Vs."],["Map each fact to a V."],["Use big-data tools and clean for veracity."],"Big Data is large, complex, fast-growing or diverse data that traditional methods struggle to handle.",["Forgetting veracity and value."])},

/* ============ TOPIC 4: Data types ============ */
{id:"c4-structure",title:"Structured, semi-structured or unstructured?",chapter:4,category:"identify",difficulty:"easy",minutes:6,
 tags:["datatypes","structure"],related:["c4-1"],
 description:"A hospital stores many kinds of data. The data team must label each source by its structure before choosing tools.",
 hint:"Fixed table → structured. Tags/keys (JSON/XML) → semi-structured. No tabular form → unstructured.",
 questions:[
  qMatch("Classify each data source.",["Structured","Semi-structured","Unstructured"],[["SQL table of patient records",0],["JSON response from a lab API",1],["X-ray images",2],["XML configuration file",1],["Doctors' free-text notes",2],["Audio recordings of consultations",2]],"Structured: fixed rows and columns. Semi-structured: flexible keys/tags (JSON, XML). Unstructured: images, text, audio, video.")],
 solution:sol(["Mixed hospital data."],["Structured, semi-structured, unstructured."],["Classify by structure."],["Use SQL for tables, parsers for JSON/XML, specialised tools for images/text."],"Structure decides how data is stored and processed.",["Calling JSON unstructured."])},

{id:"c4-variable-types",title:"What kind of variable is it?",chapter:4,category:"identify",difficulty:"medium",minutes:8,
 tags:["datatypes","stattypes"],related:["c4-2"],
 description:"A survey of students records: city, T-shirt size (S, M, L, XL), number of siblings, height in cm, and whether they own a laptop (yes/no).",
 hint:"Order matters for ordinal; counting gives discrete; measuring gives continuous.",
 questions:[
  qMatch("Classify each variable.",["Nominal","Ordinal","Discrete numerical","Continuous numerical","Boolean"],[["City",0],["T-shirt size (S, M, L, XL)",1],["Number of siblings",2],["Height in cm",3],["Owns a laptop (yes/no)",4]],"Nominal: labels without order. Ordinal: meaningful order. Discrete: counted. Continuous: measured. Boolean: true/false."),
  qSingle("What is the difference between nominal and ordinal data?",["Ordinal has a meaningful order; nominal does not","Nominal is numerical; ordinal is text","They are the same","Ordinal cannot be categorical"],0,"Exam focus: nominal has no natural order; ordinal has a meaningful order.")],
 solution:sol(["Mixed variable types."],["Categorical vs numerical; nominal vs ordinal."],["Decide order and counting/measuring."],["Pick encodings and charts that suit each type."],"Variable type controls which statistics and charts make sense.",["Treating ordinal as if it had equal spacing."])},

/* ============ TOPIC 5: Acquisition ============ */
{id:"c5-primary-secondary",title:"Primary or secondary data?",chapter:5,category:"identify",difficulty:"easy",minutes:5,
 tags:["acquisition"],related:["c5-2"],
 description:"A researcher studies how students spend their study time. She uses several data sources.",
 hint:"Did she collect it herself for this study, or did someone else already collect it?",
 questions:[
  qMatch("Classify each source.",["Primary data","Secondary data"],[["Interviews she conducts with students",0],["A national education dataset from a government repository",1],["A questionnaire she designs and hands out",0],["An open dataset downloaded from a public data repository",1],["A survey she runs on social media",0],["Data from another organisation's cloud database",1]],"Primary: collected directly for the current purpose (interview, survey, questionnaire). Secondary: already collected by someone else (repository, database, cloud).")],
 solution:sol(["Different data sources."],["Primary vs secondary data."],["Who collected it, and for what purpose."],["Check permission and quality for secondary data."],"Primary data is collected directly; secondary data already exists.",["Assuming secondary data is always accurate."])},

{id:"c5-concerns",title:"Scraping reviews for a project",chapter:5,category:"diagnose",difficulty:"medium",minutes:9,
 tags:["acquisition","quality"],related:["c5-3","c5-4"],
 description:"A student downloads 50,000 product reviews from a website and some shoppers' public profile details to predict customer sentiment. Nearly all reviews are from one city. The site has terms of use that nobody read. Some reviews are duplicates and some ratings are missing.",
 hint:"Look for risks in permission, privacy, bias and data quality.",
 questions:[
  qMulti("Select ALL concerns the student should raise.",["Permission and terms of use","Privacy of personal details","Collection bias (almost one city)","Data quality (duplicates and missing ratings)"],[0,1,2,3],"All four are real acquisition concerns."),
  qSingle("Reviews from one city only are mainly a problem of:",["Collection bias","Duplicate records","Velocity","Syntax errors"],0,"A sample from one city may not represent all customers."),
  qSingle("Duplicate rows and missing ratings affect:",["Data quality","Data velocity","Data type","Data storage cost only"],0,"Quality dimensions include completeness, uniqueness and accuracy."),
  qWritten("List four things to check before using this data.","Check permission/terms of use, protect privacy and remove personal details, assess whether the sample is representative (bias), check quality: duplicates, missing values, format and reliability.")],
 solution:sol(["Legal, privacy, bias and quality risks."],["Data acquisition concerns and data quality."],["Check source, consent, representativeness, completeness and uniqueness."],["Get permission, anonymise, widen the sample, clean the data."],"Good analysis starts with responsibly acquired, trustworthy data.",["Collecting first and asking questions later."])},

/* ============ TOPIC 6: Statistics ============ */
{id:"c6-mean-median",title:"The salary outlier",chapter:6,category:"apply",difficulty:"easy",minutes:8,
 tags:["descriptive"],related:["c6-1","c6-2"],
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
 tags:["descriptive","spread"],related:["c6-2"],
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

{id:"c6-normal",title:"Marks follow a bell curve",chapter:6,category:"interpret",difficulty:"medium",minutes:9,
 tags:["normal"],related:["c6-3"],
 description:"Marks in a large exam are approximately normally distributed with mean 60 and standard deviation 10. The curve shows the region from 50 to 70.",
 chart:{type:"normal",mu:60,sd:10,k:1,xlabel:"marks",dec:0,title:"Mean 60, SD 10: shaded mean ± 1 SD"},
 hint:"Remember 68% – 95% – 99.7 % for 1, 2 and 3 standard deviations.",
 questions:[
  qNum("Roughly what percentage of students scored between 50 and 70?",68,2,"That is mean ± 1 SD, about 68%."),
  qNum("Roughly what percentage scored between 40 and 80?",95,2,"Mean ± 2 SD, about 95%."),
  qNum("A student scored 80. How many standard deviations above the mean is that (z-score)?",2,0.01,"(80 − 60) / 10 = 2."),
  qSingle("Marks of 90 or more (3 SD above the mean) are:",["Very rare","Very common","Impossible","Exactly half the class"],0,"About 99.7% lie within ±3 SD, so far values are rare."),
  qSingle("Which curve shape is the normal distribution?",["Bell curve","Straight line","U-shape","Zig-zag"],0,"The normal distribution is the bell curve.")],
 solution:sol(["Interpreting a normal distribution."],["68–95–99.7 rule; z-score."],["Use mean ± k SD."],["Report where a student stands relative to the class."],"The 68-95-99.7 rule gives quick probabilities for normal data.",["Applying the rule to clearly skewed data."])},

{id:"c6-hypothesis",title:"Is the delivery claim true?",chapter:6,category:"interpret",difficulty:"medium",minutes:10,
 tags:["hypothesis"],related:["c6-4"],
 description:"A food company claims its average delivery time is 30 minutes. An analyst tests a sample of orders and decides on a significance level of 0.05. Test 1 gives p = 0.03. Test 2 (another city) gives p = 0.20.",
 hint:"Compare p with alpha (0.05). Small p → evidence against the null hypothesis.",
 questions:[
  qSingle("Which is the null hypothesis (H0)?",["The average delivery time is 30 minutes","The average delivery time is not 30 minutes","The sample is biased","p = 0.05"],0,"H0 is the default claim of no difference or no effect; the notes say define H0 first."),
  qSingle("In Test 1 (p = 0.03, α = 0.05) the decision is:",["Reject H0: result is statistically significant","Accept H0 as proven true","The company is lying for sure","The test failed"],0,"p < α, so the result is significant at 0.05. This is evidence against H0, not proof."),
  qSingle("In Test 2 (p = 0.20) the decision is:",["Fail to reject H0","Reject H0","Prove H0 is true","Set α to 0.20"],0,"p > α, so there is not enough evidence against H0."),
  qSingle("What does a p-value mean?",["The probability of a result at least this extreme if H0 is true","The probability that H0 is true","The probability that the test is correct","The sample size"],0,"It is not the probability that H0 is true."),
  qMatch("Put the notes' steps into the right group.",["Before the test","Test and decision"],[["Define H0",0],["Define H1",0],["Set alpha (0.05)",0],["Run the test and get the p-value",1],["Compare p with alpha and decide",1]],"Steps: H0 → H1 → alpha → run test → p-value → compare → decision.")],
 solution:sol(["Evidence about a claim."],["Hypothesis testing, p-value, significance level."],["Compare p with α."],["Report decision and avoid saying ‘proved’."],"p < α rejects H0; otherwise fail to reject.",["Reading p as the probability H0 is true."])},

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

/* ============ TOPIC 7: Classification metrics ============ */
{id:"c7-error-types",title:"Fraud alerts: four outcomes",chapter:7,category:"identify",difficulty:"easy",minutes:6,
 tags:["confusion"],related:["c7-2"],
 description:"A bank's fraud model labels each transaction ‘fraud’ (positive) or ‘no fraud’ (negative). For four transactions we know what the model said and what was really true.",
 hint:"First letter: was the model right (True/False)? Second word: what did the model predict (Positive/Negative)?",
 questions:[
  qMatch("Name each outcome.",["TP","TN","FP (Type I)","FN (Type II)"],[["Model says fraud; it really was fraud",0],["Model says no fraud; it really was genuine",1],["Model says fraud; it was a genuine transaction",2],["Model says no fraud; it really was fraud",3]],"TP/TN are correct. FP = false alarm (Type I). FN = missed case (Type II)."),
  qSingle("A genuine payment is blocked as fraud. This is a:",["False Positive (Type I error)","False Negative (Type II error)","True Positive","True Negative"],0,"The model said ‘fraud’ (positive) but it was wrong.")],
 solution:sol(["Four outcome types."],["Confusion matrix."],["Name by correctness and predicted class."],["Count each type."],"The confusion matrix compares actual with predicted classes.",["Mixing up FP and FN."])},

{id:"c7-fraud-metrics",title:"Fraud model: calculate the metrics",chapter:7,category:"apply",difficulty:"medium",minutes:12,
 tags:["confusion","accuracy","precision","recall","f1"],related:["c7-3","c7-4","c7-5","c7-6"],
 description:"On 100 test transactions the fraud model produced the confusion matrix shown. Positive = fraud.",
 chart:{type:"confusion",tp:40,tn:45,fp:5,fn:10},
 hint:"Accuracy = (TP+TN)/Total. Precision = TP/(TP+FP). Recall = TP/(TP+FN). F1 = 2PR/(P+R).",
 questions:[
  qNum("Accuracy (as a decimal, 2 d.p.)?",0.85,0.006,"(40 + 45) / 100 = 0.85."),
  qNum("Precision (decimal, 2 d.p.)?",0.89,0.006,"40 / (40 + 5) = 0.889."),
  qNum("Recall (decimal, 2 d.p.)?",0.8,0.006,"40 / (40 + 10) = 0.80."),
  qNum("F1 score (decimal, 2 d.p.)?",0.84,0.006,"2 × 0.889 × 0.80 / (0.889 + 0.80) = 0.842."),
  qNum("Specificity (decimal, 2 d.p.)?",0.9,0.006,"TN / (TN + FP) = 45 / 50 = 0.90."),
  qWritten("Interpret precision and recall in plain words for the bank manager.","Precision 0.89: of all transactions the model flagged as fraud, about 89% really were fraud (few false alarms). Recall 0.80: of all real fraud cases, the model caught 80% and missed 20%.")],
 solution:sol(["Compute and interpret metrics."],["Accuracy, precision, recall, F1, specificity."],["Substitute TP=40, TN=45, FP=5, FN=10."],["Report all metrics, not accuracy alone."],"Each metric answers a different question about the model.",["Using the wrong denominator."])},

{id:"c7-imbalanced",title:"99% accurate and useless",chapter:7,category:"diagnose",difficulty:"hard",minutes:12,
 tags:["accuracy","recall","imbalance"],related:["c7-3","c7-5","c7-7"],
 description:"Out of 1,000 transactions, only 10 are fraud. A lazy model predicts ‘no fraud’ for every transaction. Its confusion matrix is shown.",
 chart:{type:"confusion",tp:0,tn:990,fp:0,fn:10},
 hint:"Compute accuracy and recall, then ask what the bank actually cares about.",
 questions:[
  qNum("What is the accuracy (decimal)?",0.99,0.002,"(0 + 990) / 1000 = 0.99."),
  qNum("What is the recall for the fraud class?",0,0.001,"TP / (TP + FN) = 0 / 10 = 0. It catches no fraud."),
  qSingle("Why is accuracy misleading here?",["The classes are imbalanced, so always predicting the majority class scores high","Accuracy cannot be calculated","The model is perfect","Accuracy ignores true negatives"],0,"Exam focus: do not automatically choose accuracy; for imbalanced data use precision, recall, F1."),
  qSingle("Which metric should the bank watch most to avoid missing fraud?",["Recall (together with precision/F1)","Accuracy only","Specificity only","Number of rows"],0,"Recall measures how many real fraud cases are found."),
  qWritten("Explain what the ‘accuracy paradox’ is using this example.","The model has 99% accuracy but catches 0 of the 10 fraud cases. When one class dominates, accuracy rewards predicting the majority class, so a useless model looks excellent. Use recall, precision and F1 for the minority class.")],
 solution:sol(["High accuracy hides zero detection."],["Class imbalance; recall."],["Accuracy 0.99; recall 0."],["Use recall, precision, F1; consider resampling."],"A metric must match the real goal.",["Trusting accuracy on imbalanced data."])},

{id:"c7-spam",title:"Spam filter: don't lose real emails",chapter:7,category:"choose",difficulty:"medium",minutes:10,
 tags:["precision","confusion"],related:["c7-4","c7-7"],
 description:"A company's spam filter was tested on 1,000 emails. Positive = spam. Losing a genuine email in the spam folder is costly for the business.",
 chart:{type:"confusion",tp:90,tn:870,fp:30,fn:10},
 hint:"Which error does the business want to avoid: false positives or false negatives?",
 questions:[
  qSingle("Which error is most costly here?",["False Positive: genuine email marked as spam","False Negative: spam reaching the inbox","True Negative","True Positive"],0,"The notes use exactly this example: precision matters when FP is expensive."),
  qNum("What is the precision (decimal, 2 d.p.)?",0.75,0.006,"90 / (90 + 30) = 0.75."),
  qNum("What is the recall (decimal, 2 d.p.)?",0.9,0.006,"90 / (90 + 10) = 0.90."),
  qSingle("Which metric is the priority for this business?",["Precision","Recall","Neither","Range"],0,"Precision measures how many flagged emails really are spam; it reduces false alarms.")],
 solution:sol(["False alarms are costly."],["Precision vs recall."],["Precision 0.75, recall 0.90."],["Tune the filter to raise precision."],"Choose the metric by the cost of each error.",["Optimising recall when false alarms are the real cost."])},

{id:"c7-disease",title:"Disease screening: missing a patient",chapter:7,category:"choose",difficulty:"medium",minutes:10,
 tags:["recall","confusion"],related:["c7-5","c7-7"],
 description:"A model screens 200 people for a disease. Positive = sick. The confusion matrix is shown. Doctors say that sending a sick person home as ‘healthy’ is the worst outcome.",
 chart:{type:"confusion",tp:45,tn:130,fp:10,fn:15},
 hint:"Which cell represents a sick person predicted healthy?",
 questions:[
  qSingle("Which cell is the serious error?",["FN (Type II error)","FP (Type I error)","TP","TN"],0,"A false negative: sick person predicted healthy."),
  qNum("Recall / sensitivity (decimal, 2 d.p.)?",0.75,0.006,"45 / (45 + 15) = 0.75."),
  qNum("Specificity (decimal, 2 d.p.)?",0.93,0.006,"130 / (130 + 10) = 0.929."),
  qSingle("Which metric should the team try to raise first?",["Recall","Precision only","Accuracy only","Number of features"],0,"Recall = missed cases kam karna (reduce missed cases)."),
  qWritten("Explain why accuracy alone is not enough here.","Accuracy is (45+130)/200 = 0.875, which hides that 15 of 60 sick people (25%) are missed. In screening, missed cases are the main risk, so recall must be reported and improved.")],
 solution:sol(["Missed patients are the key risk."],["Recall, FN, Type II error."],["Recall 0.75 means 25% missed."],["Lower the threshold; accept more false alarms."],"Pick the metric that reflects the costly error.",["Reporting accuracy only."])},

{id:"c7-compare-models",title:"Two models, one decision",chapter:7,category:"choose",difficulty:"hard",minutes:12,
 tags:["f1","precision","recall"],related:["c7-6","c7-7"],
 description:"Two models were tested on the same screening data. Model A: precision 0.90, recall 0.50. Model B: precision 0.70, recall 0.80. Management wants one number and a recommendation.",
 chart:{type:"bars",title:"Model A vs Model B",fmt:"pct",max:1,items:[["A precision",0.9],["A recall",0.5],["B precision",0.7],["B recall",0.8]]},
 hint:"F1 is the harmonic mean: 2PR/(P+R).",
 questions:[
  qNum("F1 of Model A (decimal, 2 d.p.)?",0.64,0.006,"2 × 0.9 × 0.5 / 1.4 = 0.643."),
  qNum("F1 of Model B (decimal, 2 d.p.)?",0.75,0.006,"2 × 0.7 × 0.8 / 1.5 = 0.747."),
  qSingle("Why is F1 better than a simple average here?",["It punishes a big gap between precision and recall","It ignores recall","It ignores precision","It always equals accuracy"],0,"The harmonic mean is low if either value is low: it balances precision and recall."),
  qWritten("Which model would you recommend for screening and why? Mention one limitation of using F1.","Model B: higher F1 (0.75 vs 0.64) and much higher recall, so fewer sick patients are missed. Limitation: F1 treats precision and recall as equally important and ignores true negatives; if the costs of errors differ strongly, choose the metric by cost.")],
 solution:sol(["Choosing between two models."],["F1 score."],["F1_A 0.64; F1_B 0.75."],["Prefer B for screening."],"F1 balances precision and recall.",["Averaging precision and recall arithmetically."])},

/* ============ TOPIC 8: Over/underfitting ============ */
{id:"c8-diagnose-numbers",title:"Diagnose from accuracies",chapter:8,category:"diagnose",difficulty:"easy",minutes:6,
 tags:["fitting","underfit","overfit"],related:["c8-6"],
 description:"A student trained four models and wrote down training and test accuracy. Use the notes' quick diagnosis: both low = underfitting; very high train but much lower test (large gap) = overfitting; both high and close = good fit.",
 hint:"Look at both numbers and the gap between them.",
 questions:[
  qMatch("Diagnose each model.",["Underfitting","Overfitting","Good fit"],[["Train 58%, Test 55%",0],["Train 98%, Test 70%",1],["Train 90%, Test 88%",2],["Train 99%, Test 97%",2]],"Underfitting: both low. Overfitting: large gap, train ≫ test. Good fit: both high and close."),
  qSingle("A model that performs well on training data but poorly on new data is:",["Overfitted","Underfitted","Well generalised","Unbiased"],0,"It memorised the training data including its noise.")],
 solution:sol(["Interpret train/test accuracies."],["Under/overfitting, generalisation."],["Compare level and gap."],["Fix according to the diagnosis."],"Generalisation means performing well on unseen data.",["Judging a model from training accuracy only."])},

{id:"c8-complexity-curve",title:"Choosing model complexity",chapter:8,category:"interpret",difficulty:"medium",minutes:10,
 tags:["fitting","overfit","underfit"],related:["c8-5","c8-6"],
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
 tags:["fitting","fixes"],related:["c8-7"],
 description:"Three project teams report problems. Choose a suitable first fix for each.",
 hint:"Underfitting needs more capacity; overfitting needs less complexity or more data.",
 questions:[
  qMatch("Choose the best first fix.",["Increase model complexity or add useful features","Simplify the model / regularise / get more data","Nothing: it is a good fit"],[["Train accuracy 55%, test accuracy 54%, only two features used",0],["Train accuracy 99%, test accuracy 65%, dataset of only 80 rows",1],["Train accuracy 91%, test accuracy 89%",2]],"Both low → underfitting → add capacity/features. Large gap → overfitting → simplify, regularise, add data. Both high and close → good fit."),
  qMulti("Select ALL remedies that help against OVERFITTING.",["Regularisation","Cross-validation","Early stopping / pruning","Remove all features"],[0,1,2],"Removing all features would cause underfitting.")],
 solution:sol(["Three diagnoses."],["Fixes for under/overfitting."],["Match fix to diagnosis."],["Re-test after each change."],"Different problems need different remedies.",["Making an overfitted model even more complex."])},

{id:"c8-analogy",title:"The student analogy",chapter:8,category:"identify",difficulty:"easy",minutes:5,
 tags:["fitting"],related:["c8-4"],
 description:"A teacher explains over/underfitting with three students who prepared for an exam in different ways.",
 questions:[
  qMatch("Match each student to the fitting concept.",["Underfitting","Overfitting","Good fit"],[["Barely studied, fails old and new questions",0],["Memorised last year's paper word for word",1],["Understands the concepts and can solve any new question",2]],"This is the analogy from the notes.")],
 solution:sol(["Intuition for generalisation."],["Under/overfitting analogy."],["Match behaviour to concept."],["Aim for understanding, not memorising."],"A good model generalises like a student who understood the concepts.",["Thinking the memoriser is the best student."])},

/* ============ TOPIC 9: Tools, cleaning, charts ============ */
{id:"c9-libraries",title:"Which Python library?",chapter:9,category:"identify",difficulty:"easy",minutes:6,
 tags:["libraries"],related:["c9-1"],
 description:"A data scientist needs different libraries for different jobs in one project.",
 hint:"NumPy = numbers, Pandas = data tables, Matplotlib/Seaborn = charts, scikit-learn = ML.",
 questions:[
  qMatch("Which library fits each task?",["NumPy","Pandas","Matplotlib","Seaborn","Scikit-learn","TensorFlow / Keras"],[["np.array() and np.mean()",0],["df.read_csv-style loading, groupby and merge",1],["plt.plot(), plt.bar(), plt.scatter()",2],["sns.heatmap() and sns.boxplot()",3],["train_test_split()",4],["model.compile() and model.fit() for deep learning",5]],"From the notes: each library has typical key functions.")],
 solution:sol(["Library selection."],["Python data libraries."],["Match function to library."],["Learn the core function of each."],"Each library has a main purpose.",["Using Matplotlib for data cleaning."])},

{id:"c9-three-tools",title:"Python, Orange or Weka?",chapter:9,category:"choose",difficulty:"medium",minutes:8,
 tags:["tools"],related:["c9-2"],
 description:"Three teams need to choose a tool. Python is a full workshop with libraries (pandas, seaborn, scikit-learn). Orange is a visual tool where you drag widgets and connect them. Weka is a Java tool with menus and tabs, strong in classic machine learning.",
 hint:"Think: workshop, LEGO blocks, ready-made lab machine.",
 questions:[
  qMatch("Choose the best-fitting tool.",["Python","Orange","Weka"],[["A teacher wants a drag-and-drop demo for beginners",1],["A company needs a model wrapped in a web API and fully automated",0],["A student wants a Java-based GUI with menus for classic ML algorithms",2]],"Orange: good for demos and teaching, not designed for production. Python: build anything, automatable. Weka: classic machine learning with menus."),
  qSingle("Which tool is NOT designed for production systems?",["Orange","Python","FastAPI-wrapped Python model","Streamlit app"],0,"The notes: Orange is good for demos and teaching, not production.")],
 solution:sol(["Different needs."],["Python, Orange, Weka."],["Match tool to need."],["Use Python for production."],"Choose the tool by purpose.",["Using a teaching tool in production."])},

{id:"c9-cleaning",title:"Cleaning a messy student table",chapter:9,category:"diagnose",difficulty:"medium",minutes:10,
 tags:["cleaning"],related:["c9-3"],
 description:"A dataset of students has: a missing marks value, the same student listed twice, cities written as ‘Lahore’, ‘lahore ’ and ‘LAHORE’, and one age of 250.",
 hint:"Do not just delete rows; first understand why.",
 questions:[
  qMatch("Pick the appropriate fix.",["Remove duplicates","Impute or investigate","Standardise spelling/case","Investigate: error or real value?"],[["The same student appears twice",0],["A marks value is missing",1],["‘Lahore’, ‘lahore ’, ‘LAHORE’",2],["An age of 250",3]],"Cleaning = detect and correct inaccurate, incomplete, inconsistent, duplicate or irrelevant data."),
  qSingle("Which statement about outliers is best?",["Investigate whether they are errors or legitimate values","Always delete them","Always keep them","Replace with zero"],0,"Exam focus: cleaning is not simply deleting bad rows."),
  qSingle("Filling a missing numeric value with the column mean is called:",["Imputation","Normalisation","Encoding","Merging"],0,"Imputation replaces missing values with a justified estimate.")],
 solution:sol(["Four data-quality problems."],["Data cleaning."],["Duplicate, missing, inconsistent, outlier."],["Fix each with a justified method."],"Understand why a value is wrong before changing it.",["Deleting rows blindly."])},

{id:"c9-chart-choice",title:"Choosing the right chart",chapter:9,category:"choose",difficulty:"medium",minutes:8,
 tags:["visualization"],related:["c9-5"],
 description:"An analyst needs to answer six different questions with charts.",
 hint:"Choose the chart according to the question being answered.",
 questions:[
  qMatch("Pick the best chart.",["Bar chart","Line chart","Pie chart","Histogram","Scatter plot","Box plot"],[["Compare sales across product categories",0],["Show monthly revenue over a year",1],["Show market share of 3 companies",2],["Show the distribution of student ages",3],["Study hours vs marks",4],["Spread and outliers of salaries",5]],"Bar: categories. Line: trends over time. Pie: simple part-to-whole. Histogram: distribution. Scatter: relationship. Box: spread/outliers.")],
 solution:sol(["Six questions, six charts."],["Chart selection."],["Match purpose to chart."],["Label axes and titles."],"The question decides the chart.",["Using a pie chart for many categories."])},

{id:"c9-pipeline-words",title:"Acquisition, cleaning, manipulation, visualization",chapter:9,category:"identify",difficulty:"easy",minutes:6,
 tags:["cleaning","manipulation","acquisition","visualization"],related:["c9-3","c9-4","c9-5"],
 description:"The notes summarise four data-handling activities. Classify each action.",
 questions:[
  qMatch("Which activity is it?",["Acquisition","Cleaning","Manipulation","Visualization"],[["Download a CSV from a survey tool",0],["Remove repeated rows and fix wrong formats",1],["Group by city and compute the average marks",2],["Draw a bar chart of average marks per city",3],["Merge two tables on student ID",2],["Fix an impossible age value",1]],"Acquisition = obtain; cleaning = fix quality problems; manipulation = transform/organise; visualization = communicate patterns.")],
 solution:sol(["Four data activities."],["Acquisition, cleaning, manipulation, visualization."],["Classify the action."],["Follow the order in projects."],"Each activity has its own purpose.",["Calling merging ‘cleaning’."])},

/* ============ Integrated ============ */
{id:"c7-readmission",title:"Hospital readmission project (integrated)",chapter:7,category:"integrated",difficulty:"hard",minutes:18,
 tags:["lifecycle","roles","datatypes","confusion","recall","fitting"],related:["c1-2","c2-1","c4-1","c7-5","c8-6"],
 description:"A hospital wants to predict which patients will be readmitted within 30 days. Data: a SQL table of patient records, JSON from a lab system and free-text doctor notes. A data engineer builds the pipelines; a data scientist trains a model. On the test set: 200 patients, TP=45, TN=130, FP=10, FN=15 (positive = readmitted). Training accuracy is 97%; test accuracy is 87.5%.",
 chart:{type:"confusion",tp:45,tn:130,fp:10,fn:15},
 hint:"Break the case into lifecycle, roles, data types, metrics and fit.",
 questions:[
  qMatch("Classify each data source by structure.",["Structured","Semi-structured","Unstructured"],[["SQL table of patient records",0],["JSON from the lab system",1],["Free-text doctor notes",2]],"SQL table = structured; JSON = semi-structured; free text = unstructured."),
  qSingle("Who builds the data pipelines?",["Data Engineer","Data Analyst","Data Scientist","None of them"],0,"Data engineers build pipelines and infrastructure."),
  qNum("Recall for the ‘readmitted’ class (decimal, 2 d.p.)?",0.75,0.006,"45 / (45 + 15) = 0.75."),
  qSingle("Which error is most worrying for the hospital?",["FN: readmission risk missed","FP: extra check for a safe patient","TN","TP"],0,"A missed high-risk patient is the more serious error."),
  qSingle("Train 97% vs test 87.5%: what is the best description?",["Some overfitting (gap of about 9.5 points); investigate","Severe underfitting","Perfect generalisation","Data leakage proven"],0,"A noticeable gap with high training accuracy suggests overfitting; it is mild, so check with cross-validation."),
  qWritten("Describe how you would continue this project through the lifecycle, naming at least four stages and one metric you would report.","Problem definition (predict 30-day readmission, success criteria), data acquisition and cleaning (merge SQL, JSON and text, handle missing/duplicates), EDA, modelling, evaluation using recall (plus precision/F1) on unseen data, then deployment and monitoring for data drift.")],
 solution:sol(["Mixed data, roles, metrics and fit in one case."],["Lifecycle, roles, data types, classification metrics, overfitting."],["Combine concepts from topics 1, 2, 4, 7 and 8."],["Report recall and F1; reduce overfitting; monitor after deployment."],"Real projects combine many ideas from the course.",["Quoting accuracy only."])}
];

/* finalise: stable question ids, published flag */
SCENARIOS.forEach(s=>{s.published=s.published!==false;s.questions.forEach((q,i)=>{q.id="q"+(i+1)})});
