/* ============================================================
   RESUME DATA - single source for the ATS resume generator &
   tailored preview sheet (modules/ui.js). Mirrors the official
   master CV (assets/docs/AARADHYA_DEV_TAMRAKAR_CV.pdf).
   Loads before core modules via script.js MODULES order.
   ============================================================ */
const RESUME_DATA = {
  name: "Aaradhya Dev Tamrakar",
  subtitle: "Electronics, Communication & Information Engineer | AI/ML & Embedded Edge Systems",
  contact: "Kathmandu, Nepal · aaradhyadevtmr@gmail.com · +977 9844602050 · linkedin.com/in/aaradhya-dev-tamrakar · github.com/AaradhyaDT · aaradhyadt.github.io",
  summary: "Electronics, Communication and Information student at IOE, Kathmandu Engineering College (Year IV/I). Builds ML pipelines spanning classification, regression, tree-based ensembles, and agentic Text-to-SQL systems; deploys via FastAPI and Docker; develops Android apps with Kotlin/Jetpack Compose. Advancing through the Fusemachines AI Fellowship and NSSR DataCamp Fellowship, while leading SPARK, an ESP32-S3 edge-AI wearable fall-detection system.",
  roles: {
    all: {
      title: "Master CV — Electronics, Embedded & AI Engineering",
      sections: [
        {
          title: "Education",
          items: [
            {
              header: "Bachelor of Engineering (B.E.) in Electronics, Communication & Information",
              sub: "Institute of Engineering (IOE), Kathmandu Engineering College | Year IV / Part I (Expected: January 2027)",
              bullets: [
                "Coursework: Machine Learning · Signals and Systems · Digital Electronics · Control Systems · Communication Systems."
              ]
            }
          ]
        },
        {
          title: "Experience & Leadership",
          items: [
            {
              header: "Vice Chair — IEEE KEC KTM Student Branch",
              sub: "2026 – Present",
              bullets: [
                "Directed branch strategy, scaling initiatives and member engagement across executive committees.",
                "Managed relations across the broader technical community."
              ]
            },
            {
              header: "Event Manager — Electronics Project Club (EPC), KEC",
              sub: "2026 – Present",
              bullets: [
                "Coordinated logistics for club workshops and department activities."
              ]
            },
            {
              header: "Makerspace Ambassador — KEC Maker's Space",
              sub: "June 2026 – Present",
              bullets: [
                "Shipped site-wide fixes to the Maker's Space website — image repair, content consistency, UI cleanup."
              ]
            },
            {
              header: "Vice Secretary — IEEE KEC KTM Student Branch",
              sub: "2025 – 2026",
              bullets: [
                "Streamlined operations and grew program participation by managing documentation and orchestrating workshop logistics.",
                "Coordinated volunteers alongside the committee for seamless execution."
              ]
            },
            {
              header: "Resource Manager — Electronics Project Club (EPC), KEC",
              sub: "2024 – 2026",
              bullets: [
                "Allocated scheduling and resources for workshops across multiple departments."
              ]
            }
          ]
        },
        {
          title: "Fellowships & Recognitions",
          items: [
            {
              header: "Fuse AI Fellow — Fusemachines AI Fellowship 2026",
              sub: "Fusemachines | Active (Selected via competitive entrance exam in linear algebra, calculus, probability, Python, ML)",
              bullets: [
                "Engineered a five-stage agentic Text-to-SQL pipeline (Planner → Generator → Validator → Executor → Summarizer) validated at 100% execution success and accuracy on a 50-question benchmark.",
                "Developed an end-to-end churn & CLV pipeline achieving 5-fold CV ROC-AUC 0.841, threshold-tuned for top-200 high-risk segment with Random Forest/XGBoost ensembles, SMOTE, and SHAP explainability.",
                "Implemented probabilistic models (Bayesian estimation, Gaussian process regression via PyMC/ArviZ) and UCI Online Retail II customer segmentation (K-Means/DBSCAN).",
                "Benchmarked nine time-series forecasting models and built a 4-model ensemble achieving MASE 2.44; deployed containerized REST API with FastAPI, PostgreSQL, and Docker."
              ]
            },
            {
              header: "NSSR DataCamp Fellow — Cohort 2",
              sub: "Nepalese Society of Student Researchers | 2026 – Present",
              bullets: [
                "Secured competitive selection (April 2026) for a sponsored DataCamp Premium license in a limited cohort.",
                "Delivered six applied GenAI solutions automating null filtering, deduplication, and schema normalization across workflows.",
                "Completed coursework toward SQL Associate and Python Data Associate certifications in PostgreSQL, Pandas, statistics, and scikit-learn."
              ]
            }
          ]
        },
        {
          title: "Projects",
          items: [
            {
              header: "SPARK — Wearable Fall Detection System (Major Project)",
              sub: "ESP32-S3 · TensorFlow Lite Micro · SHAP · MQTT · FastAPI · PostgreSQL (Target Demo: March 2027)",
              bullets: [
                "Designed a two-layer ESP32-S3 fall-detection system combining a <5ms threshold gate with an INT8 1D CNN confirmation layer under 100ms.",
                "Computed per-event SHAP explanations at a local, non-cloud gateway.",
                "Led the AI and backend work package (WP 1.0) — CNN training pipeline, FastAPI/PostgreSQL gateway — within a 4-person team supervised by Er. Dipen Manandhar."
              ]
            },
            {
              header: "Gesture-Controlled Self-Balancing Robot (GCSBR) — Minor Project",
              sub: "Computer Vision · Arduino · MPU6050 · Stepper Motors · Android · MATLAB",
              bullets: [
                "Earned a 'major project level' rating from the academic examiner.",
                "Implemented PID stabilization firmware validated via a MATLAB-simulation-to-hardware pipeline.",
                "Developed an Android gesture-control app (MediaPipe, CameraX, HC-05 BT) driving motors for real-time actuation."
              ]
            },
            {
              header: "Edge AI Stability Detection System",
              sub: "Python · Scikit-learn · FastAPI · Joblib",
              bullets: [
                "Predicted platform stability from simulated IMU data using a Random Forest model, reaching 99.8% test accuracy; served via FastAPI."
              ]
            },
            {
              header: "Alpha Android Super-App",
              sub: "Kotlin · Jetpack Compose · Material3 · DataStore · Apache POI",
              bullets: [
                "Assembled a modular Android super-app (SDK 36) with gesture control, an eSewa Gmail budget tracker, and a Material3 design system."
              ]
            },
            {
              header: "Nexus — Personal AI Operating System",
              sub: "React (Vite) · FastAPI · SQLite + FTS5 · httpx · asyncio",
              bullets: [
                "Unified Groq (Llama 3.3 70B) and Gemini into an AI workspace via parallel fan-out routing, with SQLite + FTS5 context injection."
              ]
            }
          ]
        },
        {
          title: "Technical Skills",
          items: [
            {
              header: "Programming Languages",
              sub: "Python, C, C++, Kotlin, SQL (PostgreSQL / SQLite), VHDL"
            },
            {
              header: "Machine Learning & Data Science",
              sub: "scikit-learn, NumPy, Pandas, XGBoost, Random Forest, Logistic/Ridge/SGD Classifiers, Lasso, ElasticNet, SMOTE (ImbPipeline), SHAP, GridSearchCV, Stratified K-Fold CV, Joblib, PyMC, ArviZ, pgmpy, Bayesian Inference, Gaussian Process Regression, K-Means, Hierarchical Clustering, DBSCAN, Time Series (SARIMA, Holt-Winters, Prophet, LightGBM, LSTM)"
            },
            {
              header: "Android Development",
              sub: "Kotlin, Jetpack Compose, Material3, DataStore, CameraX, MediaPipe, Apache POI"
            },
            {
              header: "Deployment & Backend",
              sub: "FastAPI, REST APIs, Docker, PostgreSQL, Streamlit, asyncio, Joblib"
            },
            {
              header: "Embedded Systems & Hardware",
              sub: "Arduino, ESP32-S3, MPU6050, Stepper Motors, HC-05 BT, UART, MQTT, FPGA, Vivado"
            },
            {
              header: "AI & Local LLM Systems",
              sub: "Ollama, AnythingLLM, Prompt Chaining, Agentic Query Systems, LangChain"
            },
            {
              header: "Tools & Environments",
              sub: "Git, GitHub, VS Code, Jupyter Notebook, Google Colab, MATLAB, LaTeX / Overleaf, SSMS"
            }
          ]
        },
        {
          title: "Certifications & Activities",
          items: [
            {
              header: "Selected Credentials & Memberships",
              sub: "IEEE WIE Nepal LaTeX Workshop (May 2026) · IEEE SPAx organizing team · Prompt Engineering Fundamentals (TechAxis) · IEEEXtreme 19.0 (Team ShadowXTREME) · PCB Design & Fabrication Workshop (KEC Robotics Club) · AWS Cloud Computing Workshop · Microsoft Learn Student Ambassador · Member of IEEE KEC KTM Student Branch, Electronics Project Club, KEC Maker's Space, KEC Music Club"
            }
          ]
        }
      ]
    },
    aiml: {
      title: "AI / Machine Learning Engineer Resume",
      sections: [
        {
          title: "Summary",
          items: [
            {
              header: "AI / Machine Learning Specialization",
              sub: "Focus on Agentic Systems, Tree Ensembles with Explainability (SHAP), Bayesian Inference, and Edge-AI ML Pipelines.",
              bullets: [
                "Fusemachines AI Fellow (2026) experienced in building 5-stage Agentic Text-to-SQL workflows (100% benchmark accuracy), customer segmentation, and time-series forecasting ensembles.",
                "Engineering edge AI neural network pipelines (TFLite Micro 1D CNN INT8) with local SHAP attribution for real-time safety wearables."
              ]
            }
          ]
        },
        {
          title: "AI/ML Experience & Fellowships",
          items: [
            {
              header: "Fuse AI Fellow — Fusemachines AI Fellowship 2026",
              sub: "Fusemachines | Active (Selected via competitive entrance exam in linear algebra, calculus, probability, Python, ML)",
              bullets: [
                "Engineered a five-stage agentic Text-to-SQL pipeline (Planner → Generator → Validator → Executor → Summarizer) validated at 100% execution success and accuracy on a 50-question benchmark.",
                "Built end-to-end churn & CLV pipeline achieving 5-fold CV ROC-AUC 0.841 with Random Forest/XGBoost ensembles, SMOTE, and SHAP explainability.",
                "Implemented Bayesian estimation & Gaussian process regression via PyMC/ArviZ; segmented UCI Online Retail II customers using K-Means and DBSCAN.",
                "Benchmarked 9 forecasting models with 4-model ensemble achieving MASE 2.44; deployed containerized REST APIs with FastAPI, PostgreSQL, and Docker."
              ]
            },
            {
              header: "NSSR DataCamp Fellow — Cohort 2",
              sub: "Nepalese Society of Student Researchers | 2026 – Present",
              bullets: [
                "Delivered 6 applied GenAI workflow automation solutions (null filtering, deduplication, schema normalization).",
                "Advanced through SQL Associate and Python Data Associate tracks across PostgreSQL, Pandas, and scikit-learn."
              ]
            }
          ]
        },
        {
          title: "Selected Machine Learning Projects",
          items: [
            {
              header: "SPARK — Edge AI Wearable Fall Detection (Major Project)",
              sub: "ESP32-S3 · TensorFlow Lite Micro · SHAP · FastAPI · PostgreSQL",
              bullets: [
                "Designed two-layer fall detection architecture: <5ms threshold gate + INT8 1D CNN confirmation layer under 100ms.",
                "Integrated local per-event SHAP explainability on non-cloud edge gateway."
              ]
            },
            {
              header: "Edge AI Stability Detection System",
              sub: "Python · Scikit-learn · FastAPI · Joblib",
              bullets: [
                "Trained Random Forest classifier reaching 99.8% test accuracy on simulated IMU telemetry; served via FastAPI REST endpoint."
              ]
            },
            {
              header: "Nexus — Personal AI Operating System",
              sub: "React · FastAPI · SQLite + FTS5 · LLM Fan-Out Routing",
              bullets: [
                "Unified Groq (Llama 3.3 70B) and Gemini models via asynchronous parallel fan-out routing with FTS5 semantic context injection."
              ]
            }
          ]
        },
        {
          title: "AI/ML Technical Skills",
          items: [
            {
              header: "Core Machine Learning Stack",
              sub: "Python, scikit-learn, NumPy, Pandas, XGBoost, Random Forest, SMOTE, SHAP, PyMC, ArviZ, pgmpy, K-Means, DBSCAN, Time Series (SARIMA, Prophet, LightGBM, LSTM), TensorFlow Lite Micro, FastAPI, Docker, PostgreSQL"
            }
          ]
        }
      ]
    },
    hardware: {
      title: "Electronics & Embedded Systems Engineer Resume",
      sections: [
        {
          title: "Summary",
          items: [
            {
              header: "Embedded Systems & Edge Hardware Specialization",
              sub: "Focus on ESP32-S3, Arduino, Sensor Fusion, Robotics PID Control, and Edge-AI micro-deployments.",
              bullets: [
                "Electronics, Communication & Information Engineering student at IOE, Kathmandu Engineering College (Year IV/I).",
                "Lead developer for SPARK (ESP32-S3 edge-AI fall detection) and GCSBR (examiner-rated 'major project level' self-balancing robot)."
              ]
            }
          ]
        },
        {
          title: "Hardware & Robotics Projects",
          items: [
            {
              header: "SPARK — Wearable Fall Detection System (Major Project)",
              sub: "ESP32-S3 · TensorFlow Lite Micro · MPU6050 · MQTT · Gateway Architecture",
              bullets: [
                "Engineered two-tier detection combining a <5ms physical threshold interrupt gate with an INT8 1D CNN inference model (<100ms latency) running on ESP32-S3.",
                "Constructed edge MQTT gateway on local hardware providing deterministic per-event telemetry and explainability."
              ]
            },
            {
              header: "Gesture-Controlled Self-Balancing Robot (GCSBR) — Minor Project",
              sub: "Arduino · MPU6050 · Stepper Motors · PID Control · MATLAB · Android CameraX",
              bullets: [
                "Designed inverted pendulum PID stabilization firmware validated through a MATLAB simulation-to-hardware pipeline.",
                "Built custom Android control app with MediaPipe & CameraX over HC-05 Bluetooth for real-time motor actuation.",
                "Awarded 'major project level' evaluation by academic examiner."
              ]
            }
          ]
        },
        {
          title: "Leadership & Mentorship",
          items: [
            {
              header: "IEEE KEC KTM Student Branch & EPC Club",
              sub: "Vice Chair (2026–Present) · Event Manager (2026–Present) · Former Vice Secretary (2025–2026) · Resource Manager (2024–2026)",
              bullets: [
                "Directed student branch strategy, organized technical workshops in robotics, micro-controllers, PCB design, and LaTeX.",
                "Managed scheduling and resources for workshops across multiple engineering departments."
              ]
            }
          ]
        },
        {
          title: "Embedded Technical Skills",
          items: [
            {
              header: "Hardware & Firmware Stack",
              sub: "C, C++, VHDL, Arduino, ESP32-S3, MPU6050 IMU, Stepper Motors, HC-05 BT, UART, MQTT, FPGA (Vivado), MATLAB, Signals & Systems, Control Systems, Digital Electronics"
            }
          ]
        }
      ]
    },
    fullstack: {
      title: "Software & Android Engineer Resume",
      sections: [
        {
          title: "Summary",
          items: [
            {
              header: "Software & Mobile Development Specialization",
              sub: "Specialized in Python (FastAPI/asyncio), Android (Kotlin/Jetpack Compose), Modern JavaScript, and Containerization (Docker).",
              bullets: [
                "Proven capability building native Android applications (Jetpack Compose, CameraX, MediaPipe) and containerized backend microservices (FastAPI, PostgreSQL, Docker)."
              ]
            }
          ]
        },
        {
          title: "Software & App Projects",
          items: [
            {
              header: "Alpha Android Super-App",
              sub: "Kotlin · Jetpack Compose · Material3 · DataStore · Apache POI",
              bullets: [
                "Engineered a modular Android super-app targeting SDK 36 with gesture-based controls, eSewa Gmail budget parsing, and a Material3 design system."
              ]
            },
            {
              header: "Nexus — Personal AI Operating System",
              sub: "React (Vite) · FastAPI · SQLite + FTS5 · httpx · asyncio",
              bullets: [
                "Created an AI workspace aggregating Groq (Llama 3.3 70B) and Gemini via asynchronous fan-out routing with SQLite + FTS5 context injection."
              ]
            },
            {
              header: "Containerized Agentic REST API & Microservices",
              sub: "FastAPI · PostgreSQL · Docker · asyncio",
              bullets: [
                "Developed containerized REST API microservices with PostgreSQL and Docker under the Fusemachines AI Fellowship, featuring high-throughput async handlers."
              ]
            }
          ]
        },
        {
          title: "Software Technical Skills",
          items: [
            {
              header: "Software & App Toolstack",
              sub: "Kotlin, Jetpack Compose, Material3, Python, FastAPI, Docker, PostgreSQL, SQLite, JavaScript (ES6+), React, Git, REST APIs, asyncio, Apache POI"
            }
          ]
        }
      ]
    }
  }
};
