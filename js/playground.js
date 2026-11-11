/* Python playground: write any Python (with numpy, pandas, matplotlib ...) and run it in the browser.
   pyConsole(host)  -> the OUTPUT panel (text, tables, charts, errors, input boxes)
   labPlay(box)     -> the playground lab
   pgDecorateLessons() adds "Copy" and "Run" to the Python blocks inside the lessons */

/* ---------- output panel ---------- */
function pyConsole(host){
  host.innerHTML=`<div class="pc"><div class="pc-bar"><span class="pc-title">OUTPUT</span><span class="pc-state" role="status"></span><span class="ce-sp"></span>
    <button type="button" class="ce-btn" data-a="wrap" aria-pressed="false" aria-label="Wrap long lines" title="Wrap long lines">↵</button>
    <button type="button" class="ce-btn" data-a="clear" aria-label="Clear the output" title="Clear the output">⌫</button></div>
    <div class="pc-body" tabindex="0" role="log" aria-label="Program output"></div></div>`;
  const root=$(".pc",host),stateEl=$(".pc-state",host);
  let body=$(".pc-body",host),live=body,swapTimer=0,lastSpan=null,lastKind="";
  const EMPTY=`<span class="pc-empty">Press ▶ Run. Whatever your code prints appears here, together with tables, charts and error messages.</span>`;
  body.innerHTML=EMPTY;
  if(store.get("ds-pc-wrap",false)){root.classList.add("wrap");$('[data-a="wrap"]',host).setAttribute("aria-pressed","true")}

  /* DataFrame HTML comes from pandas; keep only plain table tags and text */
  function safeTable(html){
    const doc=new DOMParser().parseFromString(html,"text/html"),OK=new Set(["TABLE","THEAD","TBODY","TR","TH","TD","P","DIV"]);
    const copy=n=>{
      if(n.nodeType===3)return document.createTextNode(n.nodeValue);
      if(n.nodeType!==1||!OK.has(n.tagName))return null;
      const e=document.createElement(n.tagName);
      ["colspan","rowspan"].forEach(a=>{if(n.hasAttribute(a))e.setAttribute(a,String(parseInt(n.getAttribute(a),10)||1))});
      n.childNodes.forEach(c=>{const x=copy(c);if(x)e.appendChild(x)});
      return e;
    };
    const wrap=document.createElement("div");wrap.className="pc-df";
    doc.body.childNodes.forEach(c=>{const x=copy(c);if(x)wrap.appendChild(x)});
    return wrap;
  }
  const nearEnd=()=>live.scrollHeight-live.scrollTop-live.clientHeight<60;
  const toEnd=()=>{live.scrollTop=live.scrollHeight};
  function swap(){
    clearTimeout(swapTimer);swapTimer=0;
    if(body!==live){live.replaceWith(body);live=body;toEnd()}
  }
  function add(node){lastSpan=null;lastKind="";body.appendChild(node)}
  const api={
    el:root,
    state(t){stateEl.textContent=t||""},
    /* Start a fresh output. With later=true the old output stays on screen until the new one is ready (no flicker). */
    begin(later){
      clearTimeout(swapTimer);
      const nb=document.createElement("div");nb.className="pc-body";nb.tabIndex=0;nb.setAttribute("role","log");nb.setAttribute("aria-label","Program output");
      body=nb;lastSpan=null;lastKind="";
      if(later)swapTimer=setTimeout(swap,300);else swap();
    },
    commit:swap,
    clear(){api.begin(false);body.innerHTML=EMPTY;api.state("")},
    get empty(){return!body.firstChild},
    write(items){
      const stick=body!==live||nearEnd();
      items.forEach(it=>{
        if(it.k==="img"){
          const im=new Image();im.className="pc-img";im.alt="Chart drawn by your code (tap to zoom)";im.src="data:image/png;base64,"+it.s;
          im.onclick=()=>im.classList.toggle("big");add(im);
        }else if(it.k==="html")add(safeTable(it.s));
        else if(it.k==="x")api.note("Output was cut off here: your code printed more than 200,000 characters.","bad");
        else{
          if(lastKind!==it.k||!lastSpan){lastSpan=document.createElement("span");lastSpan.className="o-"+it.k;lastKind=it.k;body.appendChild(lastSpan)}
          lastSpan.appendChild(document.createTextNode(it.s));
        }
      });
      if(stick&&body===live)toEnd();
    },
    note(text,cls){const s=document.createElement("span");s.className="o-note "+(cls||"");s.textContent=text;add(s);if(body===live)toEnd()},
    error(res,onGoto){
      const d=document.createElement("div");d.className="pc-err";
      d.innerHTML=`<pre></pre>${res.hint?`<p>💡 ${esc(res.hint)}</p>`:""}${res.line&&onGoto?`<button type="button">Go to line ${res.line}</button>`:""}`;
      $("pre",d).textContent=res.trace;
      const b=$("button",d);if(b)b.onclick=()=>onGoto(res.line);
      add(d);if(body===live)toEnd();
    },
    /* input(): show a box inside the output and call back with what the student typed */
    ask(prompt,cb){
      const f=document.createElement("form");f.className="pc-in";
      f.innerHTML=`<label>⌨ Your program is waiting for input${prompt.trim()?": "+esc(prompt.trim()):""}</label><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" aria-label="Type the input for your program"><button type="submit">Enter ⏎</button>`;
      f.onsubmit=ev=>{ev.preventDefault();const i=$("input",f);i.disabled=true;$("button",f).disabled=true;cb(i.value)};
      add(f);if(body===live)toEnd();
      const i=$("input",f);try{i.focus({preventScroll:false})}catch(e){i.focus()}
    }
  };
  $(".pc-bar",host).addEventListener("click",ev=>{
    const b=ev.target.closest("button");if(!b)return;
    if(b.dataset.a==="clear")api.clear();
    else{const on=root.classList.toggle("wrap");b.setAttribute("aria-pressed",String(on));store.set("ds-pc-wrap",on)}
  });
  return api;
}

/* ---------- ready-made examples, one group per lecture week ---------- */
const PG_START=`# Write any Python here and press Run.
import numpy as np
import pandas as pd

marks = np.array([78, 91, 55, 67, 88])
print("Mean:", marks.mean())
print("Above the mean:", marks[marks > marks.mean()])

df = pd.DataFrame({"name": ["Ali", "Sara", "Usman", "Bilal", "Zara"], "marks": marks})
df[df["marks"] > 60]
`;
const PG_EXAMPLES=[
["Week 2 · Python basics",[
["w2-vars","Variables, types and f-strings",`# Variables, data types and f-strings
name = "Ayesha"
age = 20
cgpa = 3.45
passed = True

print(name, age, cgpa, passed)
print(type(name), type(age), type(cgpa), type(passed))

# f-string: put values inside text
print(f"{name} is {age} years old and has a CGPA of {cgpa:.1f}")

# arithmetic operators
print(7 + 2, 7 - 2, 7 * 2, 7 / 2)    # normal division gives a float
print(7 // 2, 7 % 2, 2 ** 3)         # floor division, remainder, power

# type conversion
marks = "85"
print(int(marks) + 5)
`],
["w2-coll","List, tuple, set and dictionary",`# The four collections
marks = [78, 91, 55, 91]        # list: ordered, can change
marks.append(60)
print(marks, len(marks))
print(marks[0], marks[-1], marks[1:3])

point = (3, 4)                  # tuple: cannot be changed
unique = set(marks)             # set: no repeated values
print(point, sorted(unique))

student = {"name": "Ali", "marks": 78}   # dictionary: key -> value
student["city"] = "Lahore"
for key, value in student.items():
    print(key, "->", value)

# list comprehension: build a list in one line
squares = [n * n for n in range(1, 6)]
print(squares)
`],
["w2-loop","Conditions, loops and functions",`# Conditions, loops and a function
def grade(m):
    if m >= 80:
        return "A"
    elif m >= 60:
        return "B"
    elif m >= 50:
        return "C"
    return "F"

marks = {"Ali": 78, "Sara": 91, "Usman": 55, "Omar": 41}

total = 0
for name, m in marks.items():
    total += m
    print(f"{name:6} {m:3}  grade {grade(m)}")

print("Average:", total / len(marks))

# while loop
n = 5
while n > 0:
    print(n, end=" ")
    n -= 1
print("Go!")
`],
["w2-calc","Calculator with input()",`# Calculator homework: input(), conditions and a loop.
# When the program asks a question, type your answer in the box under OUTPUT.
while True:
    a = float(input("First number: "))
    op = input("Operator (+ - * /): ")
    b = float(input("Second number: "))

    if op == "+":
        print("Answer:", a + b)
    elif op == "-":
        print("Answer:", a - b)
    elif op == "*":
        print("Answer:", a * b)
    elif op == "/":
        if b == 0:
            print("Cannot divide by zero")
        else:
            print("Answer:", a / b)
    else:
        print("Unknown operator")

    again = input("Another one? (y/n): ")
    if again.lower() != "y":
        break

print("Bye")
`],
["w2-np1","NumPy arrays",`import numpy as np

a = np.array([10, 20, 30, 40])
print(a, a.dtype, a.shape)      # dtype shows int32 in the browser, int64 in Colab: both are whole numbers

# vectorised maths: no loop needed
print(a * 2)
print(a + np.array([1, 2, 3, 4]))
print(a.mean(), a.sum(), a.max(), a.min(), a.std())

# boolean mask: keep only the values that pass a test
print(a[a > 15])

# 2-D array
m = np.arange(1, 7).reshape(2, 3)
print(m)
print(m.shape, m.T.shape)
print(m.sum(axis=0))    # down each column
print(m.sum(axis=1))    # across each row

# a list and an array behave differently
print([1, 2, 3] * 2)              # the list repeats
print(np.array([1, 2, 3]) * 2)    # the array multiplies
`],
["w2-np2","NumPy: ranges, random numbers, statistics",`import numpy as np

print(np.zeros(3), np.ones((2, 2)))
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))

np.random.seed(42)                       # same "random" numbers every run
marks = np.random.randint(40, 100, size=10)
print(marks)

print("mean", marks.mean(), "median", np.median(marks))
print("passed:", (marks >= 50).sum(), "of", marks.size)
print("sorted:", np.sort(marks))
print("position of the best mark:", marks.argmax())
`]]],
["Week 3 · Data acquisition",[
["w3-files","Read CSV and JSON, write CSV",`import pandas as pd
import json

# CSV file -> DataFrame   (students.csv is a practice file in this playground)
df = pd.read_csv("students.csv")
print(df.shape)
print(df.head())

# JSON file -> Python list of dictionaries -> DataFrame
with open("marks.json") as f:
    data = json.load(f)
print(data[0])
marks = pd.DataFrame(data)

# write a new CSV file: it appears under "Files" below the output
marks["total"] = marks[["maths", "physics", "english"]].sum(axis=1)
marks.to_csv("totals.csv", index=False)
marks
`],
["w3-sql","A database with SQL",`import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")       # a small database kept in memory
con.execute("CREATE TABLE students (name TEXT, city TEXT, marks INTEGER)")
con.executemany("INSERT INTO students VALUES (?, ?, ?)",
                [("Ali", "Lahore", 78), ("Sara", "Karachi", 91), ("Usman", "Lahore", 55)])

query = "SELECT city, AVG(marks) AS avg_marks FROM students GROUP BY city"
df = pd.read_sql_query(query, con)
con.close()
df
`]]],
["Week 4 · Data cleaning",[
["w4-clean","Missing values, duplicates, wrong values",`import pandas as pd

df = pd.read_csv("students.csv")
print("Before:", df.shape)
print(df.isnull().sum())                 # missing values in each column

# 1. duplicate rows
print("Duplicate rows:", df.duplicated().sum())
df = df.drop_duplicates()

# 2. inconsistent text: lahore, KARACHI -> Lahore, Karachi
df["city"] = df["city"].str.strip().str.title()
print(df["city"].unique())

# 3. impossible values: an age of 150 is a mistake
df.loc[df["age"] > 100, "age"] = None

# 4. missing values: fill with the median or the mean
df["age"] = df["age"].fillna(df["age"].median())
df["marks"] = df["marks"].fillna(df["marks"].mean())

print("After:", df.shape)
df
`],
["w4-scale","Outliers, scaling and encoding",`import pandas as pd

df = pd.DataFrame({
    "name": ["Ali", "Sara", "Usman", "Zara", "Omar"],
    "city": ["Lahore", "Karachi", "Lahore", "Islamabad", "Karachi"],
    "salary": [40000, 52000, 45000, 48000, 400000],
})

# outliers with the IQR rule
q1, q3 = df["salary"].quantile(0.25), df["salary"].quantile(0.75)
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print("Fences:", low, high)
print(df[(df["salary"] < low) | (df["salary"] > high)])

df = df[df["salary"] <= high].copy()

# feature scaling
s = df["salary"]
df["minmax"] = (s - s.min()) / (s.max() - s.min())      # 0 to 1
df["zscore"] = (s - s.mean()) / s.std(ddof=0)           # mean 0, std 1

# categorical encoding
df["city_label"] = df["city"].astype("category").cat.codes        # label encoding
onehot = pd.get_dummies(df["city"], prefix="city", dtype=int)     # one-hot encoding

pd.concat([df, onehot], axis=1).round(2)
`]]],
["Week 5 · Pandas",[
["w5-df","Series, DataFrame and inspecting",`import pandas as pd

s = pd.Series([78, 91, 55], index=["Ali", "Sara", "Usman"])
print(s["Sara"], s.mean(), s.idxmax())

df = pd.read_csv("sales.csv")

print(df.head(3))               # first rows
print(df.shape)                 # (rows, columns)
print(df.columns.tolist())
print(df.dtypes)
df.info()
df.describe()
`],
["w5-filter","Filter, sort and new columns",`import pandas as pd

df = pd.read_csv("sales.csv")
df["revenue"] = df["units"] * df["price"]              # new column

print(df[df["units"] > 20])                            # filter rows
print(df[(df["region"] == "Punjab") & (df["product"] == "Phone")])
print(df[["month", "product", "revenue"]].head(3))     # choose columns

print(df.loc[0, "product"], df.iloc[0, 3])             # by label, by position
print(df["product"].value_counts())

df.sort_values("revenue", ascending=False).head(3)
`],
["w5-group","groupby, aggregation and merge",`import pandas as pd

sales = pd.read_csv("sales.csv")
sales["revenue"] = sales["units"] * sales["price"]

print(sales.groupby("product")["units"].sum())
print(sales.groupby("region")["revenue"].agg(["sum", "mean", "count"]))
print(sales.pivot_table(index="month", columns="product", values="units",
                        aggfunc="sum", fill_value=0, sort=False))

# merge = join two tables on a shared column
students = pd.read_csv("students.csv").drop_duplicates()
students["city"] = students["city"].str.title()
cities = pd.read_csv("cities.csv")

merged = students.merge(cities, on="city", how="left")
merged[["name", "city", "province"]].head(6)
`]]],
["Week 6 · EDA",[
["w6-eda","Descriptive statistics and correlation",`import pandas as pd

df = pd.read_csv("students.csv").drop_duplicates()
df = df[df["age"].isna() | (df["age"] < 100)]      # drop the impossible age

m = df["marks"]
print("mean", round(m.mean(), 2), "median", m.median())
print("range", m.max() - m.min(), "variance", round(m.var(), 2), "std", round(m.std(), 2))
print("most common study hours (mode):", df["study_hours"].mode().tolist())
print(m.describe())

# relationship between two columns
print("r(study_hours, marks) =", round(df["study_hours"].corr(df["marks"]), 3))

# correlation matrix of all the numeric columns
df.corr(numeric_only=True).round(2)
`]]],
["Week 7 · Visualization",[
["w7-line","Matplotlib: line and bar chart",`import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("sales.csv")
df["revenue"] = df["units"] * df["price"]
by_month = df.groupby("month", sort=False)["revenue"].sum() / 1e6

plt.plot(by_month.index, by_month.values, marker="o")
plt.title("Revenue by month")
plt.xlabel("Month")
plt.ylabel("Revenue (million Rs)")
plt.grid(True)
plt.show()

units = df.groupby("product")["units"].sum()
plt.bar(units.index, units.values, color=["#4c72b0", "#dd8452", "#55a868"])
plt.title("Units sold by product")
plt.ylabel("Units")
plt.show()
`],
["w7-dist","Histogram, box plot and scatter plot",`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(1)
hours = np.random.uniform(1, 10, 60)
marks = 35 + 6 * hours + np.random.normal(0, 6, 60)

plt.hist(marks, bins=10, edgecolor="white")
plt.title("Histogram: the distribution of marks")
plt.show()

plt.boxplot(marks, vert=False)
plt.title("Box plot: median, spread and outliers")
plt.show()

plt.scatter(hours, marks)
plt.title("Scatter plot: study hours against marks")
plt.xlabel("Study hours")
plt.ylabel("Marks")
plt.show()

print("r =", round(np.corrcoef(hours, marks)[0, 1], 3))
`],
["w7-sns","Seaborn heatmap (extra download)",`# seaborn is downloaded the first time you run this (needs internet)
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("students.csv").drop_duplicates()
df["city"] = df["city"].str.title()
df = df[df["age"].isna() | (df["age"] < 100)]

sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm", vmin=-1, vmax=1)
plt.title("Correlation heatmap")
plt.show()

sns.boxplot(data=df, x="city", y="marks")
plt.title("Marks in each city")
plt.show()
`]]],
["Week 10 · Machine learning",[
["w10-split","Train / validation / test split",`import numpy as np
import pandas as pd

np.random.seed(7)
hours = np.random.uniform(1, 10, 100)
df = pd.DataFrame({"hours": hours, "marks": 30 + 6 * hours + np.random.normal(0, 5, 100)})

# shuffle, then 70% train, 15% validation, 15% test
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
n = len(df)
train = df.iloc[:int(0.70 * n)]
val = df.iloc[int(0.70 * n):int(0.85 * n)]
test = df.iloc[int(0.85 * n):]
print(len(train), len(val), len(test))

# learn a straight line from the TRAINING data only
slope, intercept = np.polyfit(train["hours"], train["marks"], 1)
print(f"marks = {slope:.2f} * hours + {intercept:.2f}")

def error(part):
    predicted = slope * part["hours"] + intercept
    return round(float(np.sqrt(((part["marks"] - predicted) ** 2).mean())), 2)

print("train error:", error(train))
print("validation error:", error(val))
print("test error:", error(test))
`],
["w10-fit","Underfitting and overfitting",`import numpy as np
import matplotlib.pyplot as plt

np.random.seed(3)
x = np.sort(np.random.uniform(0, 1, 30))
y = np.sin(2 * np.pi * x) + np.random.normal(0, 0.25, 30)
test = np.arange(30) % 3 == 0          # every third point is kept for testing
train = ~test

grid = np.linspace(0, 1, 200)
plt.scatter(x[train], y[train], label="train")
plt.scatter(x[test], y[test], label="test", marker="x")

for degree in [1, 3, 12]:
    coef = np.polyfit(x[train], y[train], degree)
    def error(mask):
        return np.sqrt(np.mean((np.polyval(coef, x[mask]) - y[mask]) ** 2))
    print(f"degree {degree:2}: train error {error(train):.2f}   test error {error(test):.2f}")
    plt.plot(grid, np.polyval(coef, grid), label=f"degree {degree}")

plt.ylim(-2, 2)
plt.legend()
plt.title("Too simple, about right, too complex")
plt.show()
`],
["w10-sk","scikit-learn model (big download)",`# scikit-learn is a big download the first time (about 30 MB, use Wi-Fi)
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import numpy as np

np.random.seed(7)
hours = np.random.uniform(1, 10, 100)
marks = 30 + 6 * hours + np.random.normal(0, 5, 100)
X = hours.reshape(-1, 1)                 # features must be 2-D

X_train, X_test, y_train, y_test = train_test_split(X, marks, test_size=0.2, random_state=42)
print(X_train.shape, X_test.shape)

model = LinearRegression()
model.fit(X_train, y_train)              # learn from the training data only
print("slope", round(model.coef_[0], 2), "intercept", round(model.intercept_, 2))
print("R2 on training data:", round(model.score(X_train, y_train), 3))
print("R2 on test data:", round(model.score(X_test, y_test), 3))
print("Prediction for 8 hours:", round(model.predict([[8]])[0], 1))
`]]]];
const PG_FLAT=PG_EXAMPLES.flatMap(g=>g[1]);
let pgAutoRun=false;

/* ---------- the lab ---------- */
function labPlay(box){
  let cur=store.get("ds-pg","mine");
  const original=id=>id==="mine"?PG_START:id==="lesson"?store.get("ds-pg-lesson-src",PG_START):(PG_FLAT.find(e=>e[0]===id)||[0,0,PG_START])[2];
  if(cur!=="mine"&&cur!=="lesson"&&!PG_FLAT.some(e=>e[0]===cur))cur="mine";
  if(cur==="lesson"&&!store.get("ds-pg-lesson-src",""))cur="mine";
  box.innerHTML=`<div class="card pg"><h3>Python playground</h3>
   <p>Write any Python and press <b>Run</b>. It is real Python running inside your browser, so it works on a phone. <b>numpy</b>, <b>pandas</b> and <b>matplotlib</b> are downloaded automatically when your code imports them. <small class="muted">The first run needs internet (engine ≈ 10 MB, pandas + numpy ≈ 9 MB more); after that your browser keeps them.</small></p>
   <div id="pyStatus" class="pystatus"></div>
   <label for="pgSel">Start from</label><select id="pgSel"></select>
   <div id="pgEd"></div>
   <div class="btnrow pg-run"><button class="b go" id="pgRun">▶ Run</button><button class="b stop" id="pgStop" hidden>■ Stop</button><button class="b alt" id="pgReset">Reset code</button></div>
   <div id="pgOut"></div>
   <label>Files your code can open <small class="muted">(tap one to look inside)</small></label>
   <div class="pg-files" id="pgFiles"></div>
   <input type="file" id="pgUp" hidden accept=".csv,.tsv,.txt,.json,.xlsx,.xls,text/*,application/json">
   <details><summary>Tips for using the playground</summary>
    <ul class="pg-tips">
     <li>The value of the <b>last line</b> is shown automatically, like in Colab. A DataFrame is drawn as a table. Use <span class="code">print()</span> for everything else.</li>
     <li><span class="code">plt.show()</span> draws the chart in the output. Tap a chart to zoom.</li>
     <li><span class="code">input()</span> works: an answer box appears in the output.</li>
     <li>Practice files: <span class="code">pd.read_csv("students.csv")</span> (has missing values, a duplicate and messy text), <span class="code">sales.csv</span>, <span class="code">cities.csv</span>, <span class="code">marks.json</span>. Add your own with <b>＋ Add a file</b>.</li>
     <li>Also available: <span class="code">seaborn</span>, <span class="code">scipy</span>, <span class="code">sklearn</span>, <span class="code">sqlite3</span> (bigger downloads).</li>
     <li>The row of symbol keys under the code helps on a phone keyboard. <b>⇥</b> indents, <b>⇤</b> removes an indent.</li>
     <li>With a keyboard: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> runs, <kbd>Ctrl</kbd> + <kbd>/</kbd> comments lines, <kbd>Tab</kbd> indents (press <kbd>Esc</kbd> then <kbd>Tab</kbd> to leave the editor).</li>
     <li>A loop that never ends is stopped after 30 seconds, or press <b>■ Stop</b>.</li>
     <li>Your code is saved in this browser only.</li>
    </ul></details></div>`;
  if(PY.job)PY.stop();   /* the lab was re-opened while something was still running */
  PY.watch($("#pyStatus",box));
  const sel=$("#pgSel",box),runBtn=$("#pgRun",box),stopBtn=$("#pgStop",box);
  const con=pyConsole($("#pgOut",box));
  const ed=codeEditor($("#pgEd",box),{id:"pgCode",label:"Python code",onRun:()=>run(),onChange:v=>store.set("ds-pg-code-"+cur,v)});
  let running=false,stdin=[],seed=0,token=0,files=Object.keys(PY_FILES).map(n=>[n,PY_FILES[n].length]);
  PY.userFiles.forEach((d,n)=>{if(!files.some(f=>f[0]===n))files.push([n,d.length])});

  function fillSel(){
    const lesson=store.get("ds-pg-lesson-src","");
    sel.innerHTML=`<option value="mine">📝 My code (blank page)</option>${lesson?`<option value="lesson">📖 Code from the lesson</option>`:""}`+
      PG_EXAMPLES.map(([g,list])=>`<optgroup label="${g}">${list.map(([id,t])=>`<option value="${id}">${esc(t)}</option>`).join("")}</optgroup>`).join("");
    sel.value=cur;
  }
  function load(){ed.value=store.get("ds-pg-code-"+cur,original(cur))}
  function setRunning(on){running=on;runBtn.disabled=on;stopBtn.hidden=!on;if(on)runBtn.textContent="Running…";else runBtn.textContent="▶ Run"}
  function showFiles(){
    $("#pgFiles",box).innerHTML=files.map(([n])=>`<button type="button" class="chip" data-f="${esc(n).replace(/"/g,"&quot;")}">📄 ${esc(n)}</button>`).join("")+`<button type="button" class="chip add" data-add="1">＋ Add a file</button>`;
  }

  async function exec(replay){
    const my=++token,code=ed.value,usesInput=/\binput\s*\(/.test(code);
    setRunning(true);ed.clearError();con.begin(replay);
    if(!replay){con.state("");if(window.innerWidth<760)setTimeout(()=>con.el.scrollIntoView({block:"nearest",behavior:"smooth"}),50)}
    try{
      const res=await PY.exec({code,stdin,seed:usesInput?seed:null,limit:30000,onOut:items=>{if(my===token)con.write(items)}});
      if(my!==token)return;
      con.commit();
      if(Array.isArray(res.files)&&res.files.length){files=res.files;showFiles()}
      if(res.status==="input"){
        con.state("Waiting for your input");
        con.ask(res.prompt||"",v=>{stdin.push(v);exec(true)});
      }else if(res.status==="error"){
        ed.markError(res.line);
        con.error(res,n=>ed.gotoLine(n));
        con.state("Stopped by an error");
      }else{
        if(con.empty)con.note("(Your code ran but printed nothing. Use print(...) to show a value.)");
        con.note(`✓ Finished in ${res.ms<1000?Math.max(1,Math.round(res.ms))+" ms":(res.ms/1000).toFixed(1)+" s"}`,"ok");
        con.state("Finished");
      }
    }catch(err){
      if(my!==token)return;
      con.commit();
      const m=err&&err.message;
      if(m==="timeout")con.note("⏱ Stopped after 30 seconds. Your code probably has a loop that never ends (for example a while whose condition stays True). Fix it and run again.","bad");
      else if(m==="stopped")con.note("■ Stopped.","bad");
      else if(m==="busy")con.note("Python is still busy with another run. Wait a moment or press Stop.","bad");
      else con.note("⚠ The Python engine is not available. "+(PY.msg||"Check your internet connection and press Run again."),"bad");
      con.state("");
    }
    if(my===token)setRunning(false);
  }
  function run(){
    if(running)return;
    stdin=[];seed=Math.floor(Math.random()*2147483647);
    exec(false);
  }

  fillSel();load();showFiles();
  sel.onchange=()=>{cur=sel.value;store.set("ds-pg",cur);load();con.clear()};
  runBtn.onclick=run;
  stopBtn.onclick=()=>PY.stop("stopped");
  $("#pgReset",box).onclick=()=>{if(confirm("Replace the code in the editor with the original?")){ed.value=original(cur);store.set("ds-pg-code-"+cur,ed.value);con.clear()}};
  $("#pgFiles",box).onclick=async ev=>{
    const b=ev.target.closest("button");if(!b)return;
    if(b.dataset.add){$("#pgUp",box).click();return}
    const name=b.dataset.f;
    let info=await PY.peek(name);
    if(!info){
      const local=PY_FILES[name]!=null?PY_FILES[name]:PY.userFiles.has(name)?new TextDecoder().decode(PY.userFiles.get(name).slice(0,6000)):null;
      info=local==null?{kind:"text",data:"Press Run once, then tap the file again."}:{kind:"text",data:local.slice(0,6000),more:local.length>6000};
    }
    con.begin(false);con.state(name);
    if(info.kind==="img")con.write([{k:"img",s:info.data}]);
    else{con.write([{k:"o",s:info.data}]);if(info.more)con.note("… only the first part of the file is shown.")}
  };
  $("#pgUp",box).onchange=ev=>{
    const f=ev.target.files[0];ev.target.value="";if(!f)return;
    if(f.size>8*1024*1024){alert("That file is larger than 8 MB. Use a smaller file.");return}
    const name=f.name.replace(/[\\/]/g,"_");
    const r=new FileReader();
    r.onload=()=>{
      const data=new Uint8Array(r.result);PY.addFile(name,data);
      files=files.filter(x=>x[0]!==name);files.push([name,data.length]);showFiles();
      con.begin(false);con.note(`Added ${name}. Open it in your code, for example:  pd.read_csv("${name}")`,"ok");
    };
    r.readAsArrayBuffer(f);
  };
  if(pgAutoRun){pgAutoRun=false;run()}
}

/* ---------- "Run" and "Copy" on the Python blocks inside the lessons ---------- */
function pgDecorateLessons(){
  $$("section.page pre.code").forEach(pre=>{
    if(pre.closest(".cb")||pre.children.length)return;
    pre.classList.add("py");
    const wrap=document.createElement("div");wrap.className="cb";
    const canRun=!pre.hasAttribute("data-norun");
    wrap.innerHTML=`<div class="cb-bar"><span>Python</span><button type="button" data-a="copy">Copy</button>${canRun?`<button type="button" class="cb-run" data-a="run">▶ Run</button>`:""}</div>`;
    pre.replaceWith(wrap);wrap.appendChild(pre);
    const code=pre.textContent.replace(/\s+$/,"")+"\n";
    wrap.firstChild.onclick=ev=>{
      const b=ev.target.closest("button");if(!b)return;
      if(b.dataset.a==="copy"){
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(()=>{b.textContent="Copied ✓";setTimeout(()=>{b.textContent="Copy"},1200)},()=>{});
        return;
      }
      store.set("ds-pg-lesson-src",code);store.set("ds-pg-code-lesson",code);store.set("ds-pg","lesson");store.set("ds-lab","play");
      pgAutoRun=true;go("labs");window.scrollTo(0,0);
    };
  });
}
