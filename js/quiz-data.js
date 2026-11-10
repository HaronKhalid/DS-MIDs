/* Concept questions. Format: [topic number, question, options, correct index, explanation].
   mk() puts the correct option at a varied position so the answer is not always "A".
   QCODE holds "predict the output" questions; every expected output was checked by running the code in Python. */
const mk=(t,q,c,w,e)=>{const i=(q.length*7+c.length*3)%(w.length+1);const o=w.slice();o.splice(i,0,c);return[t,q,o,i,e]};
const mkc=(ch,prompt,code,c,w,explain)=>{const i=(code.length*5+c.length)%(w.length+1);const o=w.slice();o.splice(i,0,c);return{ch,prompt,code,options:o,answer:i,explain}};

const QZ=[
/* ---- 1. Data Science and lifecycle ---- */
mk(1,"Which statement best defines Data Science?","Extracting useful insights from raw data using statistics, programming and domain knowledge",["Only storing data in a database","Only drawing charts","Only building websites"],"Data Science mixes statistics, programming and domain knowledge to get insight from raw data."),
mk(1,"Which three kinds of knowledge does Data Science combine?","Statistics, programming and domain knowledge",["Painting, music and sport","Hardware, printing and networking","Law, history and art"],"These three are named in the notes."),
mk(1,"What is the FIRST step of the Data Science lifecycle?","Problem definition",["Deployment","Model training","Visualisation"],"First understand what has to be solved."),
mk(1,"Which step tests the model on unseen rows?","Evaluation",["Data collection","Data cleaning","Problem definition"],"Evaluation checks how the model works on data it has not seen."),
mk(1,"Which step puts the model live and keeps checking it?","Deployment and monitoring",["EDA","Data collection","Data cleaning"],"The model is made live and then monitored for errors and drift."),
mk(1,"Data cleaning mainly deals with:","Missing, incorrect and duplicate data",["Writing the final report","Buying servers","Choosing a logo"],"Cleaning fixes weak, missing, incorrect or duplicate values."),
mk(1,"What is the purpose of EDA (Exploratory Data Analysis)?","Explore the data and find patterns",["Deploy the model","Delete the dataset","Define the business"],"EDA = explore data, look for patterns, relationships and problems."),
mk(1,"Which order of lifecycle steps is correct?","Define → acquire → clean → EDA → model → evaluate → deploy → monitor",["Model → define → deploy → clean","Deploy → clean → acquire → define","Evaluate → acquire → define → model"],"Exam focus: Understand → Acquire → Explore → Clean → Analyze → Engineer → Model → Evaluate → Deploy → Monitor."),
mk(1,"Which is a typical first check in EDA (from the notes)?","shape, info, describe and a null check",["Train a deep network","Deploy to the cloud","Buy more data"],"The notes list: shape → info → describe → null check."),
mk(1,"Do all lifecycle frameworks use exactly the same number of stages?","No: different frameworks use different numbers or names of stages",["Yes: exactly 5 stages","Yes: exactly 10 stages","Yes: exactly 3 stages"],"The order of ideas is similar, but names and counts vary."),

/* ---- 2. Roles ---- */
mk(2,"Who builds data pipelines and data infrastructure?","Data Engineer",["Data Analyst","Business presenter","Graphic designer"],"Engineers build pipelines (tools: Spark, Hadoop, Airflow, Kafka)."),
mk(2,"Who mainly creates reports and dashboards?","Data Analyst",["Data Engineer","ML Engineer","Network administrator"],"Analysts focus on reporting and visualisation (Excel, SQL, Tableau, Power BI)."),
mk(2,"Who mainly builds models and does statistics?","Data Scientist",["Data Analyst","Data Engineer","Web designer"],"Scientists do modelling and statistics (Python, R, SQL, TensorFlow)."),
mk(2,"Who deploys a model into production?","Machine Learning Engineer",["Data Analyst","Statistician only","Data entry clerk"],"ML Engineers deploy models (PyTorch, TensorFlow, Docker)."),
mk(2,"Which tools match a Data Engineer?","Spark, Hadoop, Airflow, Kafka",["Excel and Power BI","Photoshop","Word and PowerPoint"],"Pipeline and big-data tools."),
mk(2,"Which tools match a Data Analyst?","Excel, SQL, Tableau, Power BI",["Spark and Kafka","PyTorch and Docker","Airflow"],"Reporting and BI tools."),
mk(2,"Which tools match an ML Engineer?","PyTorch, TensorFlow, Docker",["Excel, Power BI","Hadoop only","Photoshop"],"Deep-learning frameworks plus deployment tools."),
mk(2,"Which role designs the overall data architecture and integration?","Data Architect",["Data Analyst","Data Entry Operator","Tester"],"Architects design how data systems fit together."),
mk(2,"Which role connects business needs with data solutions?","Business / Domain Analyst",["Data Engineer only","Database server","Compiler"],"They bring domain knowledge and communication."),

/* ---- 3. Big data ---- */
mk(3,"What are the 5 Vs of Big Data?","Volume, Velocity, Variety, Veracity, Value",["Volume, Value, Visual, Variable, Vector","Velocity, Vision, Variance, Value, Volume","Variety, Vault, Volume, Visit, Value"],"Volume, Velocity, Variety, Veracity, Value."),
mk(3,"What does Volume describe?","How much data there is (terabytes, petabytes)",["How fast data arrives","How trustworthy data is","How useful data is"],"Volume = how much."),
mk(3,"What does Velocity describe?","The speed at which data is generated and processed (e.g. real-time data)",["The size of data","The types of data","The accuracy of data"],"Velocity = how fast."),
mk(3,"What does Variety describe?","The different forms of data (structured, semi-structured, unstructured)",["The speed of data","The amount of data","The profit from data"],"Variety = how many forms."),
mk(3,"What does Veracity describe?","The accuracy and trustworthiness of data",["The speed of data","The amount of data","The number of columns"],"Veracity = how trustworthy."),
mk(3,"What does Value describe?","The useful business insight obtained from data",["The price of the server","The size of the file","The speed of the network"],"Value = how useful."),
mk(3,"Stock prices arriving every millisecond mainly show which V?","Velocity",["Volume","Veracity","Value"],"The speed of arrival is velocity."),
mk(3,"Fake accounts that make records unreliable mainly affect which V?","Veracity",["Volume","Velocity","Variety"],"Trustworthiness is veracity."),
mk(3,"Which is the best definition of Big Data?","Very large, complex, fast-growing or diverse data that traditional methods may struggle to handle",["Any file bigger than 1 MB","Only data stored in Excel","Only data from social media"],"Big data is not only about size."),

/* ---- 4. Data types ---- */
mk(4,"Which is structured data?","A SQL table of student records",["A folder of photos","A collection of audio files","Free-text emails"],"Structured data has fixed rows and columns."),
mk(4,"Which is semi-structured data?","JSON or XML",["A SQL table","A photograph","A video"],"Semi-structured data has flexible keys/tags."),
mk(4,"Which is unstructured data?","Images, text and audio",["A SQL table","A CSV with fixed columns","An Excel table"],"No predefined tabular structure."),
mk(4,"What separates ordinal from nominal data?","Ordinal categories have a meaningful order",["Ordinal data is numeric only","Nominal data has an order","There is no difference"],"Exam focus: nominal has no natural order; ordinal does."),
mk(4,"‘Number of students in a class’ is which type?","Discrete numerical",["Continuous numerical","Nominal","Ordinal"],"Counted whole numbers are discrete."),
mk(4,"‘Height or temperature’ is which type?","Continuous numerical",["Discrete numerical","Nominal","Boolean"],"Measured values on a scale are continuous."),
mk(4,"‘Low, medium, high’ is which type?","Ordinal",["Nominal","Continuous","Boolean"],"Categories with a natural order."),
mk(4,"‘City name’ is which type?","Nominal",["Ordinal","Continuous","Discrete"],"Labels with no order."),
mk(4,"True/False or 1/0 values are called:","Boolean",["Nominal","Continuous","Text"],"A Boolean has two possible values."),

/* ---- 5. Data acquisition ---- */
mk(5,"The notes describe data as:","Raw facts and figures",["Only finished reports","Only charts","Only code"],"Data starts as raw facts and figures."),
mk(5,"Which is NOT a form of data in the notes?","Telepathic",["Pictorial","Textual","Digital"],"The notes list pictorial, textual and digital forms."),
mk(5,"Which is an example of PRIMARY data collection?","An interview, survey or questionnaire you run yourself",["Downloading a public repository","Reading another company's database","Using a cloud dataset someone else made"],"Primary data is collected directly for the current purpose."),
mk(5,"Which is an example of SECONDARY data?","Data from a repository, database or cloud source collected by someone else",["Your own survey","Your own interview","A questionnaire you designed"],"Secondary data already exists."),
mk(5,"A government census dataset you download is:","Secondary data",["Primary data","Unstructured only","Not data"],"It was collected by someone else."),
mk(5,"Data from sensors you install for your own experiment is:","Primary data",["Secondary data","Always unstructured","Not usable"],"You collect it directly for your purpose."),
mk(5,"Which are key concerns when acquiring data?","Permission, privacy, quality, relevance and bias",["Only colour and font","Only file size","Only the programming language"],"Responsible acquisition checks all of these."),
mk(5,"Having no repeated rows is which quality dimension?","Uniqueness",["Completeness","Timeliness","Validity"],"Uniqueness: no unwanted duplicates."),
mk(5,"Having all required values present is which quality dimension?","Completeness",["Uniqueness","Validity","Consistency"],"Missing values reduce completeness."),

/* ---- 6. Statistics ---- */
mk(6,"What is the mean?","Sum of values divided by the number of values",["The middle value","The most frequent value","Maximum minus minimum"],"Mean = sum / count."),
mk(6,"What is the median?","The middle value after sorting",["The average","The most frequent value","The largest value"],"Median is the middle of sorted data."),
mk(6,"What is the mode?","The most frequent value",["The middle value","The average","The range"],"Mode = most frequent."),
mk(6,"What is variance?","The average of squared deviations from the mean",["The square root of the mean","The middle value","Maximum minus minimum"],"Variance measures spread using squared deviations."),
mk(6,"What is standard deviation?","The square root of variance",["The square of the mean","The median minus mean","The range divided by 2"],"It measures typical distance from the mean."),
mk(6,"Which measure is more robust to extreme values?","Median",["Mean","Variance","Range"],"The mean is sensitive to extreme values; the median is robust."),
mk(6,"Range equals:","Maximum minus minimum",["Mean minus median","Variance squared","Mode minus mean"],"Range = max − min."),
mk(6,"In a normal distribution, about what percentage of data is within 1 standard deviation of the mean?","68%",["50%","95%","99.7%"],"68–95–99.7 rule."),
mk(6,"About what percentage lies within 2 standard deviations?","95%",["68%","50%","99.7%"],"68–95–99.7 rule."),
mk(6,"About what percentage lies within 3 standard deviations?","99.7%",["68%","95%","50%"],"68–95–99.7 rule."),
mk(6,"What does the correlation coefficient r = Cov(X,Y)/(sx·sy) measure?","The strength and direction of the relationship between two variables",["The causes of a variable","The mean of X","The number of rows"],"Correlation measures association, not causation."),
mk(6,"Ice-cream sales and drowning rise together. What is the correct conclusion?","They are correlated; hot weather probably drives both, so ice cream does not cause drowning",["Ice cream causes drowning","Drowning causes ice-cream sales","They must be unrelated"],"Correlation does not mean causation."),
mk(6,"A p-value below 0.05 (with α = 0.05) usually means:","The result is statistically significant: reject H0",["H0 is proven true","The data has no outliers","The model is perfect"],"Small p = evidence against H0."),
mk(6,"What does a p-value represent?","The probability of a result at least this extreme assuming H0 is true",["The probability that H0 is true","The probability the data is correct","The sample size"],"It is not the probability that H0 is true."),
mk(6,"Which is the correct order of the hypothesis-testing steps in the notes?","Define H0 → define H1 → set alpha → run test → p-value → compare → decision",["Decision → H0 → alpha","Run test → alpha → H0","p-value → H1 → H0"],"H0, H1, alpha (0.05), test, p-value, compare, decide."),
mk(6,"The mean of 10, 20 and 30 is:","20",["10","30","60"],"(10+20+30)/3 = 20."),
mk(6,"The median of 3, 9 and 5 is:","5",["3","9","6"],"Sorted: 3, 5, 9 → middle value 5."),
mk(6,"A probability value always lies between:","0 and 1",["−1 and 1","0 and 100 only","1 and 10"],"0 = impossible, 1 = certain."),

/* ---- 7. Classification metrics ---- */
mk(7,"What is classification?","A supervised task that predicts a categorical class or label",["Predicting a continuous number","Grouping unlabeled data","Drawing charts"],"Examples: fraud / not fraud, spam / not spam."),
mk(7,"What is the formula for accuracy?","(TP + TN) / (TP + TN + FP + FN)",["TP / (TP + FP)","TP / (TP + FN)","TN / (TN + FP)"],"Accuracy = correct predictions / all predictions."),
mk(7,"What is the formula for precision?","TP / (TP + FP)",["TP / (TP + FN)","(TP + TN) / Total","TN / (TN + FP)"],"Of predicted positives, how many were correct."),
mk(7,"What is the formula for recall?","TP / (TP + FN)",["TP / (TP + FP)","(TP + TN) / Total","FP / (FP + TN)"],"Of actual positives, how many were found."),
mk(7,"What is the F1 score?","The harmonic mean of precision and recall",["The arithmetic mean of accuracy and recall","The sum of TP and TN","Precision minus recall"],"F1 = 2PR / (P + R)."),
mk(7,"What is specificity?","TN / (TN + FP)",["TP / (TP + FN)","TP / (TP + FP)","(TP + TN) / Total"],"How many actual negatives were correctly identified."),
mk(7,"A False Positive is also called:","Type I error",["Type II error","True positive","Type III error"],"The model said ‘yes’ but it was wrong."),
mk(7,"A False Negative is also called:","Type II error",["Type I error","True negative","Accuracy"],"The model said ‘no’ but it was actually ‘yes’."),
mk(7,"Genuine transaction predicted as fraud is a:","False Positive",["False Negative","True Positive","True Negative"],"Predicted positive, actually negative."),
mk(7,"Actual fraud predicted as ‘no fraud’ is a:","False Negative",["False Positive","True Positive","True Negative"],"Predicted negative, actually positive."),
mk(7,"With TP=30, TN=50, FP=10, FN=10, the accuracy is:","0.80",["0.75","0.50","0.90"],"(30 + 50) / 100 = 0.80."),
mk(7,"With TP=30 and FP=10, the precision is:","0.75",["0.25","0.33","0.80"],"30 / (30 + 10) = 0.75."),
mk(7,"Why can accuracy be misleading?","On imbalanced data a model that always predicts the majority class can still score high",["Accuracy cannot be calculated","Accuracy ignores correct predictions","Accuracy is always 50%"],"Use precision, recall or F1 for imbalanced data."),
mk(7,"Which metric matters most when a false positive is very costly (e.g. a genuine email marked spam)?","Precision",["Recall","Range","Mean"],"Precision reduces false alarms."),
mk(7,"Which metric matters most when missing a real case is dangerous (e.g. disease screening)?","Recall",["Precision only","Accuracy only","Variance"],"Recall reduces missed cases."),
mk(7,"A confusion matrix compares:","Actual classes with predicted classes",["Mean with median","Training time with test time","Two datasets' sizes"],"It shows TP, TN, FP and FN."),

/* ---- 8. Overfitting and underfitting ---- */
mk(8,"What is overfitting?","The model memorises the training data including noise and performs poorly on new data",["The model is too simple to learn the pattern","The model is perfect on all data","The model has no training data"],"Looks excellent on training, poor on new data."),
mk(8,"What is underfitting?","The model is too simple and performs poorly on both training and new data",["The model memorised the data","The model performs well on all data","The model uses too many features"],"It has not learned the pattern."),
mk(8,"Train accuracy 98% and test accuracy 70% suggest:","Overfitting",["Underfitting","Good fit","No pattern at all"],"Large gap: high training, much lower test."),
mk(8,"Train accuracy 58% and test accuracy 55% suggest:","Underfitting",["Overfitting","Good fit","Perfect fit"],"Both are low and close."),
mk(8,"Train accuracy 90% and test accuracy 88% suggest:","Good fit",["Overfitting","Underfitting","Data leakage"],"Both high and close together."),
mk(8,"Underfitting is also described as:","High bias",["High variance","Low bias","Perfect generalisation"],"Overfitting is high variance."),
mk(8,"Overfitting is also described as:","High variance",["High bias","Low variance","Underfitting"],"The model is too sensitive to the training data."),
mk(8,"The main fix for underfitting is to:","Increase model complexity, add useful features or train longer",["Remove all features","Use less data","Add more regularisation"],"Give the model more capacity."),
mk(8,"Which helps against overfitting?","Simplify the model, regularise, cross-validate and add more data",["Make the model more complex","Train on test data","Remove validation"],"Reduce complexity or increase data."),
mk(8,"What is generalisation?","Performing well on new data the model has never seen",["Performing well on training data only","Memorising the data","Using fewer features"],"The model's real job is to do well on new data."),
mk(8,"In the student analogy, overfitting is a student who:","Memorised last year's paper word for word",["Barely studied","Understands every concept","Never took the exam"],"The memoriser fails new questions."),
mk(8,"A learning curve for overfitting shows:","Training error low, validation error high, with a wide gap",["Both errors high and close","Both errors low and close","No errors"],"The gap is the warning sign."),

/* ---- 9. Tools, cleaning, charts ---- */
mk(9,"Which library is used for numerical computing and arrays?","NumPy",["Matplotlib","Seaborn","Orange"],"np.array(), np.mean(), np.dot()."),
mk(9,"Which library is used for data manipulation with DataFrames?","Pandas",["NumPy only","Weka","Orange"],"read_csv, groupby, merge."),
mk(9,"Which library provides basic plotting such as plt.plot() and plt.bar()?","Matplotlib",["Pandas","Scikit-learn","Weka"],"Basic charts."),
mk(9,"Which library provides sns.heatmap() and sns.boxplot()?","Seaborn",["NumPy","Keras","SciPy"],"Statistical visualisation."),
mk(9,"train_test_split() belongs to:","Scikit-learn",["Matplotlib","Pandas","Seaborn"],"Scikit-learn is the machine-learning library."),
mk(9,"Which tool lets you drag widgets and connect them with lines?","Orange",["Weka","NumPy","Streamlit"],"Orange is a visual tool: ‘LEGO blocks’."),
mk(9,"Weka is:","A Java tool with menus and tabs, strong in classic machine learning",["A plotting library","A SQL database","A programming language"],"From the notes."),
mk(9,"Which tool is good for demos and teaching but not designed for production systems?","Orange",["Python with an API","Streamlit app","FastAPI service"],"The notes say so."),
mk(9,"Which chart is best for a trend over time?","Line chart",["Pie chart","Histogram","Box plot"],"Monthly revenue is a classic line chart."),
mk(9,"Which chart shows the distribution of a numerical variable?","Histogram",["Pie chart","Line chart","Bar chart of two categories"],"Age distribution is a histogram."),
mk(9,"Which chart shows the relationship between two numerical variables?","Scatter plot",["Pie chart","Bar chart","Histogram"],"Study hours vs marks."),
mk(9,"Which chart shows spread and outliers?","Box plot",["Pie chart","Line chart","Scatter plot of one variable"],"Box plots show median, quartiles and outliers."),
mk(9,"What is the best approach to an outlier?","Investigate whether it is an error or a legitimate value",["Always delete it","Always keep it","Replace it with zero"],"Cleaning is not simply deleting rows."),
mk(9,"Which is an example of data manipulation?","Grouping by city and averaging marks, or merging tables",["Drawing a pie chart","Downloading a CSV","Interviewing people"],"Manipulation = transform and organise data."),
mk(9,"Which is an example of data cleaning?","Removing duplicate rows and fixing impossible ages",["Merging two tables","Plotting a histogram","Training a model"],"Cleaning fixes quality problems.")
];

const QCODE=[
mkc(6,"What does this program print?","nums = [2, 4, 6]\nprint(sum(nums) / len(nums))","4.0",["12","3","4"],"sum = 12, len = 3, 12 / 3 = 4.0 (division gives a float)."),
mkc(7,"What does this program print?","tp, tn, fp, fn = 30, 50, 10, 10\nprint((tp + tn) / (tp + tn + fp + fn))","0.8",["0.75","80","0.5"],"(30 + 50) / 100 = 0.8."),
mkc(7,"What does this program print?","tp, fp = 30, 10\nprint(tp / (tp + fp))","0.75",["0.25","3.0","0.33"],"Precision = 30 / 40 = 0.75."),
mkc(7,"What does this program print?","tp, fn = 8, 2\nprint(tp / (tp + fn))","0.8",["0.2","4.0","0.75"],"Recall = 8 / 10 = 0.8."),
mkc(7,"What does this program print?","p, r = 0.5, 0.5\nprint(2 * p * r / (p + r))","0.5",["1.0","0.25","0.0"],"2 × 0.25 / 1.0 = 0.5."),
mkc(4,"What does this program print?","person = {\"name\": \"Ali\", \"marks\": [70, 80]}\nprint(person[\"marks\"][1])","80",["70","Ali","marks"],"person['marks'] is the list [70, 80]; index 1 is the second item."),
mkc(8,"What does this program print?","train, test = 98, 70\nprint(\"overfit\" if train - test > 10 else \"ok\")","overfit",["ok","True","28"],"The gap is 28, which is greater than 10."),
mkc(9,"What does this program print?","import numpy as np\na = np.array([1, 2, 3, 4])\nprint(a.mean())","2.5",["10","2","3"],"(1+2+3+4)/4 = 2.5."),
mkc(9,"What does this program print?","total = 0\nfor v in [1, 2, 3]:\n    total += v * 2\nprint(total)","12",["6","3","8"],"2 + 4 + 6 = 12."),
mkc(6,"What does this program print?","vals = [2, 4, 4, 4, 5, 5, 7, 9]\nmean = sum(vals) / len(vals)\nvar = sum((v - mean) ** 2 for v in vals) / len(vals)\nprint(var ** 0.5)","2.0",["4.0","5.0","32.0"],"mean 5, variance 4, standard deviation 2.0."),
mkc(9,"What does this program print?","x = [10, 20, 30]\nprint([(v - min(x)) / (max(x) - min(x)) for v in x])","[0.0, 0.5, 1.0]",["[10, 20, 30]","[0, 1, 2]","[0.1, 0.2, 0.3]"],"Min-max scaling maps the smallest value to 0 and the largest to 1."),
mkc(9,"What does this program print?","print(len(set([1, 2, 2, 3, 3, 3])))","3",["6","2","1"],"A set removes duplicates: {1, 2, 3} has 3 items."),
mkc(9,"What does this program print?","x = [1, 2, 3, 4, 5]\nprint(x[1:4])","[2, 3, 4]",["[1, 2, 3, 4]","[2, 3, 4, 5]","[1, 2, 3]"],"Slicing x[1:4] starts at index 1 and stops before index 4.")
];
