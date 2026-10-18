<!-- converted from AARADHYA_DEV_TAMRAKAR_CV.docx -->

| AARADHYA DEV TAMRAKAR AI/ML · Edge AI · Computer Vision · Formal Methods · Robotics Kathmandu, Nepal • aaradhyadevtmr@gmail.com • +977 9844602050 • linkedin.com/in/aaradhya-dev-tamrakar • github.com/AaradhyaDT • aaradhyadt.github.io |  |
| --- | --- |

PROFILE
Final-year Electronics, Communication and Information Engineering student at IOE, Kathmandu Engineering College, focused on applied ML, edge AI, computer vision, statistical evaluation, and formal verification. Builds reproducible end-to-end systems spanning model training, quantitative evaluation, explainability, APIs, embedded inference, and SMT-based verification. Current work includes BiasAperture, SPARK, and a Headless Invariant Assurance Engine for state-machine verification and counterexample replay.
EDUCATION
Bachelor of Engineering (B.E.)	Expected: January 2027
Electronics, Communication and Information Engineering — Tribhuvan University, Institute of Engineering (IOE), Kathmandu Engineering College | Year IV / Part II
Coursework: Machine Learning · Signals and Systems · Digital Electronics · Control Systems · Communication Systems
Cumulative Percentage: 75%
EXPERIENCE
Vice Chair	2026 – Present
IEEE KEC KTM Student Branch
- Directed branch strategy, scaling initiatives and member engagement across executive committees.
- Managed relations across the broader technical community.
Event Manager	2026 – Present
Electronics Project Club (EPC), Kathmandu Engineering College
- Coordinated logistics for club workshops and department activities.
Makerspace Ambassador	June 2026 – Present
KEC Maker’s Space, Kathmandu Engineering College
- Shipped site-wide fixes to the Maker’s Space website — image repair, content consistency, UI cleanup.
Vice Secretary	2025 – 2026
IEEE KEC KTM Student Branch
- Streamlined operations and grew program participation by managing documentation and orchestrating workshop logistics.
- Coordinated volunteers alongside the committee for seamless execution.
Resource Manager	2024 – 2026
Electronics Project Club (EPC), Kathmandu Engineering College
- Allocated scheduling and resources for workshops across multiple departments.
FELLOWSHIPS & RECOGNITIONS
Fuse AI Fellow — Fusemachines AI Fellowship 2026	2026 – Present
Fusemachines
- Engineered a five-stage agentic Text-to-SQL pipeline (Planner → Generator → Validator → Executor → Summarizer), achieving 100% execution success and accuracy on a 50-question benchmark.
- Built containerized AI services using FastAPI, PostgreSQL, and Docker.
- Developed a churn/CLV pipeline achieving 5-fold CV ROC-AUC 0.841, with threshold tuning and SHAP explainability.
- Applied Random Forest, XGBoost, Bayesian inference, Gaussian processes, clustering, and forecasting across applied datasets.
- Worked with UCI Online Retail II (~500K transactions) for segmentation and forecasting, achieving MASE 2.44 with a four-model ensemble.
NSSR DataCamp Fellow — Cohort 2	2026 – Present
Nepalese Society of Student Researchers
- Secured competitive selection (April 2026) for a sponsored DataCamp Premium license, one of a limited cohort.
- Delivered six applied GenAI solutions, automating null filtering, deduplication, and schema normalization across product and data workflows.
- Completed coursework toward SQL Associate and Python Data Associate certifications in PostgreSQL, Pandas, statistics, and scikit-learn.

PROJECTS
BiasAperture — Vision Fairness & Bias Audit (Fellowship Capstone)
AIF360 · Fairlearn · FairFace · SHAP · Statistical Testing
- Developed a diagnostic fairness-auditing framework with dual AIF360/Fairlearn backends computing DPD, DIR, EOP, and EOD, with harmonized metric definitions and deterministic report generation.
- Validated on the FairFace benchmark (97,698 images) with BCa bootstrap confidence intervals (B ≥ 1,000), χ²/Fisher testing, n ≥ 30 safeguards, and Shapley attribution for flagged disparities.
- Co-authored with Tisha Manandhar; M1–M4 completed, M5 System Orchestration & Case Studies at 95%, with 78/78 repository tests passing.
SPARK — Wearable Fall Detection System (Major Project)
ESP32-S3 · 1D CNN · TensorFlow Lite Micro · SHAP · BLE · FastAPI
- Developed the ML pipeline on SisFall with subject-grouped 5-fold cross-validation, achieving 0.9185 AUC-ROC (38,420 windows) and 87.81% sensitivity; built an INT8 post-training quantizer exporting an 18.5 KB TFLite Micro model.
- Built the local BLE/serial gateway, SHAP attribution pipeline, JSON event store, PDF reporting, and REST dashboard; led ML modeling, quantization, and gateway work in a 4-person team.
- Repository test suite reports 48/48 passing; physical hardware bring-up, on-device BLE validation, and final deployment remain in the project roadmap.
Gesture-Controlled Self-Balancing Robot (GCSBR) — Minor Project
Computer Vision · Arduino · MPU6050 · Stepper Motors · Android · MATLAB
- Implemented PID stabilization firmware, validated via a MATLAB-simulation-to-hardware pipeline.
- Developed an Android gesture-control app (MediaPipe, CameraX, HC-05 BT) driving motors for real-time actuation.
Edge AI Stability Detection System — GCSBR Support Project
Python · scikit-learn · FastAPI · Joblib · IMU Data
- Predicted platform stability from simulated IMU data using a Random Forest model, reaching 99.8% test accuracy; served the persisted model via FastAPI with Joblib export for integration into GCSBR.
Headless Invariant Assurance Engine (INV-BMK-001)
Python · Z3 · SMT-LIB2 · State Machines · Sandbox Replay · Pytest
- Developed a formal verification benchmark that encodes state-machine contracts into SMT-LIB2/Z3, proves candidate invariants inductively, generates counterexamples, and replays them in a concrete Python sandbox; latest run evaluated 12 properties across 4 state machines, discovered and replay-confirmed 4/4 planted violations (100% recall), recorded 0.0% false-discovery rate, and measured 10.844 ms mean solver latency.
nepali-ocr-ai — Low-Resource Document Intelligence
Python · Multimodal Vision · Tesseract · Devanagari · OpenXML
- Prototyped a hybrid Nepali document pipeline combining multimodal vision OCR with local Tesseract fallback, Devanagari normalization, and contextual Varnavinyas checks; includes Preeti↔Unicode transcoding and DOCX repair workflows.
Super-NLM — Multi-Account NotebookLM Hub & MCP Server
Python · FastAPI · MCP · NotebookLM · asyncio
- Built an MCP server and web dashboard for multi-account NotebookLM access with round-robin routing, quota-aware cooldown/retry, multi-turn account pinning, cross-notebook synthesis, folder sync, and scheduled Studio artifact generation.
SKILLS
Programming: Python, C, C++, SQL, Kotlin, VHDL
ML/Statistical Learning: PyTorch, TensorFlow, scikit-learn, XGBoost, Random Forest, PyMC, clustering, forecasting
Fairness/Explainability: SHAP, AIF360, Fairlearn, statistical testing, bootstrap confidence intervals
AI Systems: FastAPI, Docker, PostgreSQL, SQLite/FTS5, asyncio, MCP
Computer Vision/Edge AI: OpenCV, MediaPipe, TensorFlow Lite Micro, ONNX, Tesseract
Formal Methods/Verification: Z3, SMT-LIB2, state-machine verification, deterministic replay, pytest · Embedded/Robotics: ESP-IDF, FreeRTOS, ESP32-S3, Arduino, MPU6050, UART/I2C/SPI, MQTT, FPGA/Vivado · Tools: Git, GitHub, Jupyter, MATLAB, Colab, LaTeX/Overleaf
CERTIFICATIONS & ACTIVITIES
IEEE WIE Nepal LaTeX Workshop (May 2026) · IEEE SPAx organizing team · Prompt Engineering Fundamentals, TechAxis · IEEEXtreme 19.0 (Team ShadowXTREME) · PCB Design & Fabrication Workshop, KEC Robotics Club · AWS Cloud Computing Workshop · Microsoft Learn Student Ambassador
Active in IEEE KEC, EPC, KEC Maker’s Space, and KEC Music Club. | Last Updated: September 30, 2026