export interface PredictionRecord {
  id: string;
  disease: string;
  symptoms: string[];
  confidence: number;
  date: string;
  suggestion: string;
  completed: boolean;
  allResults?: { disease: string; confidence: number }[];
  homeCare?: string[];
  precautions?: string[];
  urgency?: "low" | "moderate" | "high";
  tasks?: { text: string; done: boolean }[];
}

// Symptom categories for weighting
const COMMON_SYMPTOMS = new Set([
  "cough", "mild fever", "fatigue", "headache", "body ache",
  "nausea", "congestion", "sneezing", "runny nose", "dizziness",
]);

const SYMPTOM_WEIGHT = {
  common: 0.3,    // generic symptoms get low weight
  moderate: 0.7,  // somewhat distinguishing
  unique: 1.5,    // highly distinguishing symptoms get boosted
};

interface DiseaseEntry {
  symptoms: string[];
  uniqueSymptoms: string[];
  suggestion: string;
  homeCare: string[];
  precautions: string[];
  urgency: "low" | "moderate" | "high";
  tasks: string[];
  recommendedFoods: string[];
  foodsToAvoid: string[];
  doctorVisitAdvice: string;
}

const diseaseDatabase: Record<string, DiseaseEntry> = {
  "Common Cold": {
    symptoms: ["cough", "sneezing", "runny nose", "sore throat", "mild fever", "congestion"],
    uniqueSymptoms: ["sneezing", "runny nose", "congestion"],
    suggestion: "Rest well, drink warm fluids, and monitor symptoms. Consult a doctor if symptoms persist beyond 7 days.",
    homeCare: ["Drink warm water with honey and lemon", "Steam inhalation 2-3 times a day", "Gargle with warm salt water", "Get 8+ hours of sleep"],
    precautions: ["Wash hands frequently", "Avoid close contact with others", "Cover mouth when coughing/sneezing"],
    urgency: "low",
    tasks: ["Rest for at least 2 days", "Monitor temperature twice daily", "Stay hydrated with warm fluids"],
    recommendedFoods: ["Chicken soup or vegetable broth", "Warm honey-lemon water", "Citrus fruits (oranges, lemons) for vitamin C", "Ginger tea", "Garlic-rich foods for immunity", "Steamed vegetables"],
    foodsToAvoid: ["Dairy products (may increase mucus)", "Fried and greasy foods", "Sugary drinks and sweets", "Cold beverages"],
    doctorVisitAdvice: "Monitor for 3–5 days. If symptoms worsen or fever exceeds 101°F, consult a doctor within 1–2 days.",
  },
  "Influenza (Flu)": {
    symptoms: ["high fever", "body ache", "fatigue", "headache", "cough", "chills"],
    uniqueSymptoms: ["high fever", "chills", "body ache"],
    suggestion: "Stay hydrated, rest completely, and seek medical attention if breathing becomes difficult.",
    homeCare: ["Stay in bed and rest completely", "Drink plenty of fluids (water, broth, electrolytes)", "Use a cool compress for fever", "Keep room well-ventilated"],
    precautions: ["Isolate from family members", "Wear a mask if around others", "Disinfect frequently touched surfaces"],
    urgency: "moderate",
    tasks: ["Consult a doctor if fever persists 48+ hours", "Monitor fever every 4 hours", "Stay hydrated — drink 2L+ water daily"],
    recommendedFoods: ["Clear broths and soups", "Electrolyte drinks (coconut water, ORS)", "Bananas for potassium", "Toast and crackers", "Herbal teas (chamomile, peppermint)", "Vitamin C-rich fruits"],
    foodsToAvoid: ["Spicy foods", "Alcohol and caffeine", "Heavy, oily meals", "Processed junk food"],
    doctorVisitAdvice: "If fever exceeds 103°F or lasts more than 3 days, consult a doctor immediately. Seek emergency care if you experience difficulty breathing.",
  },
  "Migraine": {
    symptoms: ["severe headache", "nausea", "sensitivity to light", "vomiting", "blurred vision"],
    uniqueSymptoms: ["severe headache", "sensitivity to light"],
    suggestion: "Rest in a dark, quiet room. Avoid known triggers and stay hydrated.",
    homeCare: ["Rest in a dark, quiet room", "Apply cold compress to forehead", "Avoid screens and bright lights", "Practice deep breathing"],
    precautions: ["Identify and avoid migraine triggers", "Maintain regular sleep schedule", "Stay hydrated throughout the day"],
    urgency: "moderate",
    tasks: ["Track migraine triggers in a journal", "Consult a neurologist if recurring", "Rest in a dark room at onset"],
    recommendedFoods: ["Magnesium-rich foods (spinach, almonds, avocado)", "Omega-3 rich fish (salmon, sardines)", "Whole grains", "Ginger tea for nausea relief", "Watermelon and cucumber for hydration", "Dark leafy greens"],
    foodsToAvoid: ["Aged cheeses", "Chocolate and caffeine (may trigger some people)", "Alcohol especially red wine", "MSG-containing foods", "Processed meats"],
    doctorVisitAdvice: "If migraines occur more than 4 times per month or last over 72 hours, consult a neurologist. Seek immediate care if accompanied by confusion, seizures, or neck stiffness.",
  },
  "Gastroenteritis": {
    symptoms: ["diarrhea", "nausea", "vomiting", "stomach cramps", "mild fever", "dehydration"],
    uniqueSymptoms: ["diarrhea", "stomach cramps", "dehydration"],
    suggestion: "Stay hydrated with ORS, eat bland foods (BRAT diet), and rest. Consult a doctor if symptoms last more than 48 hours.",
    homeCare: ["Drink ORS frequently", "Follow BRAT diet: Bananas, Rice, Applesauce, Toast", "Avoid dairy, caffeine, and spicy foods", "Rest your stomach — eat small portions"],
    precautions: ["Wash hands before eating", "Avoid street food temporarily", "Don't share utensils or towels"],
    urgency: "moderate",
    tasks: ["Prepare and drink ORS every 2 hours", "Switch to bland diet for 48 hours", "See a doctor if symptoms exceed 48 hours"],
    recommendedFoods: ["Bananas (easy to digest, potassium-rich)", "Plain white rice", "Applesauce", "Dry toast or crackers", "Clear broths", "Coconut water for electrolytes", "Boiled potatoes"],
    foodsToAvoid: ["Dairy products", "Spicy and fried foods", "Raw vegetables and salads", "Caffeine and alcohol", "Citrus fruits (may irritate stomach)"],
    doctorVisitAdvice: "Monitor for 1–2 days. If vomiting/diarrhea persists beyond 48 hours, or if you see blood in stool, visit a doctor immediately.",
  },
  "Allergic Rhinitis": {
    symptoms: ["sneezing", "itchy eyes", "runny nose", "congestion", "watery eyes"],
    uniqueSymptoms: ["itchy eyes", "watery eyes"],
    suggestion: "Avoid allergens, use a saline nasal spray, and consult an allergist for long-term management.",
    homeCare: ["Use saline nasal spray regularly", "Keep windows closed during high pollen", "Shower after outdoor activities", "Use an air purifier indoors"],
    precautions: ["Avoid known allergens (dust, pollen, pet dander)", "Keep home dust-free", "Wear a mask during high pollen days"],
    urgency: "low",
    tasks: ["Schedule allergy test with allergist", "Clean air filters at home", "Track allergen triggers"],
    recommendedFoods: ["Turmeric milk (anti-inflammatory)", "Local honey (may help with pollen allergies)", "Omega-3 rich foods (walnuts, flaxseed)", "Vitamin C-rich fruits (kiwi, strawberries)", "Green tea", "Probiotic-rich yogurt"],
    foodsToAvoid: ["Histamine-rich foods (fermented foods, aged cheese)", "Alcohol", "Artificial preservatives and colorings", "Shellfish (if allergic)"],
    doctorVisitAdvice: "If symptoms persist for more than 2 weeks or significantly affect daily life, consult an allergist for testing and long-term management.",
  },
  "Bronchitis": {
    symptoms: ["persistent cough", "chest discomfort", "fatigue", "shortness of breath", "mild fever", "mucus"],
    uniqueSymptoms: ["persistent cough", "chest discomfort", "mucus"],
    suggestion: "Use a humidifier, stay hydrated, and rest. Consult a doctor if cough lasts over 3 weeks.",
    homeCare: ["Use a humidifier in your room", "Drink warm fluids frequently", "Avoid smoke and air pollutants", "Sleep with head elevated"],
    precautions: ["Don't smoke or be near smokers", "Wear a mask in polluted areas", "Avoid cold air exposure"],
    urgency: "moderate",
    tasks: ["See a doctor for proper diagnosis", "Monitor cough duration — seek help if >3 weeks", "Use humidifier daily"],
    recommendedFoods: ["Warm honey-ginger tea", "Garlic and onion-based soups", "Turmeric milk", "Steamed vegetables", "Citrus fruits", "Warm water with lemon"],
    foodsToAvoid: ["Cold drinks and ice cream", "Fried and processed foods", "Excessive dairy", "Smoke and alcohol"],
    doctorVisitAdvice: "If cough persists beyond 3 weeks, produces blood-tinged mucus, or you have difficulty breathing, consult a doctor within 1–2 days.",
  },
  "Urinary Tract Infection": {
    symptoms: ["painful urination", "frequent urination", "lower abdominal pain", "cloudy urine", "mild fever"],
    uniqueSymptoms: ["painful urination", "cloudy urine", "lower abdominal pain"],
    suggestion: "Drink plenty of water and see a doctor promptly for proper diagnosis and treatment.",
    homeCare: ["Drink 3+ liters of water daily", "Avoid caffeine and alcohol", "Use a heating pad on lower abdomen", "Urinate frequently — don't hold it"],
    precautions: ["Practice good hygiene", "Wipe front to back", "Urinate after intercourse"],
    urgency: "high",
    tasks: ["Visit a doctor for urine test", "Drink extra water for 1 week", "Complete prescribed treatment fully"],
    recommendedFoods: ["Cranberry juice (unsweetened)", "Plenty of water (3+ liters daily)", "Probiotic-rich yogurt", "Vitamin C-rich fruits (blueberries, oranges)", "Watermelon and cucumber", "Green vegetables"],
    foodsToAvoid: ["Caffeine and coffee", "Alcohol", "Spicy foods", "Artificial sweeteners", "Sugary foods and drinks"],
    doctorVisitAdvice: "⚠️ Consult a doctor as soon as possible — ideally within 1 day. UTIs require proper medical treatment. Seek emergency care if you develop high fever, back pain, or blood in urine.",
  },
  "Hypertension": {
    symptoms: ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath", "fatigue"],
    uniqueSymptoms: ["chest pain", "dizziness"],
    suggestion: "Monitor blood pressure regularly, reduce salt intake, and exercise. Consult a cardiologist.",
    homeCare: ["Reduce salt in meals", "Walk 30 minutes daily", "Practice stress-relief techniques", "Monitor BP twice daily"],
    precautions: ["Limit alcohol and caffeine", "Avoid high-sodium processed foods", "Manage stress actively"],
    urgency: "high",
    tasks: ["Buy a home BP monitor", "Consult a cardiologist", "Reduce daily salt intake to <5g"],
    recommendedFoods: ["Bananas (potassium-rich)", "Leafy greens (spinach, kale)", "Oats and whole grains", "Berries (blueberries, strawberries)", "Beetroot juice", "Low-fat yogurt", "Garlic"],
    foodsToAvoid: ["High-sodium foods (pickles, chips, processed foods)", "Red meat in excess", "Sugary beverages", "Canned soups and sauces", "Excessive caffeine"],
    doctorVisitAdvice: "⚠️ Please consult a cardiologist as soon as possible. If you experience severe chest pain, sudden vision changes, or difficulty breathing, visit a hospital immediately.",
  },
  "Type 2 Diabetes": {
    symptoms: ["frequent urination", "excessive thirst", "fatigue", "blurred vision", "slow healing", "weight loss"],
    uniqueSymptoms: ["excessive thirst", "slow healing", "weight loss"],
    suggestion: "Monitor blood sugar levels, follow a balanced diet, and exercise regularly. Consult an endocrinologist.",
    homeCare: ["Eat balanced meals at regular times", "Exercise for 30 mins daily", "Check blood sugar before meals", "Stay well hydrated"],
    precautions: ["Avoid sugary drinks and refined carbs", "Take care of foot health", "Regular eye checkups"],
    urgency: "high",
    tasks: ["Get HbA1c blood test done", "Consult an endocrinologist", "Start a food diary to track sugar intake"],
    recommendedFoods: ["Non-starchy vegetables (broccoli, spinach, cauliflower)", "Whole grains (brown rice, quinoa)", "Lean protein (grilled chicken, fish, lentils)", "Nuts and seeds (almonds, chia seeds)", "Berries in moderation", "Bitter gourd and fenugreek"],
    foodsToAvoid: ["White rice and white bread", "Sugary drinks (soda, fruit juices)", "Sweets and desserts", "Fried foods", "Processed and packaged snacks"],
    doctorVisitAdvice: "⚠️ Consult a doctor within 1–2 days for blood sugar testing. If you experience extreme thirst, confusion, or fruity-smelling breath, visit a hospital immediately — these may indicate a diabetic emergency.",
  },
  "Anxiety Disorder": {
    symptoms: ["restlessness", "rapid heartbeat", "difficulty concentrating", "insomnia", "excessive worry", "muscle tension"],
    uniqueSymptoms: ["excessive worry", "restlessness", "muscle tension", "insomnia"],
    suggestion: "Practice mindfulness and deep breathing. Consider therapy (CBT). Consult a mental health professional.",
    homeCare: ["Practice 4-7-8 breathing technique", "Limit caffeine intake", "Exercise regularly", "Maintain a consistent sleep schedule"],
    precautions: ["Avoid excessive screen time before bed", "Limit news and social media consumption", "Build a support network"],
    urgency: "moderate",
    tasks: ["Try 10 mins of daily meditation", "Consult a therapist for CBT", "Establish a calming bedtime routine"],
    recommendedFoods: ["Chamomile tea", "Dark chocolate (in moderation)", "Omega-3 rich foods (salmon, walnuts)", "Magnesium-rich foods (spinach, pumpkin seeds)", "Bananas", "Turmeric and green tea", "Complex carbs (oats, sweet potatoes)"],
    foodsToAvoid: ["Excessive caffeine (coffee, energy drinks)", "Alcohol", "Sugary snacks and processed foods", "Highly processed fast food"],
    doctorVisitAdvice: "If anxiety significantly disrupts daily life, sleep, or work for more than 2 weeks, consult a mental health professional. Seek immediate help if you experience panic attacks or thoughts of self-harm.",
  },

  // ── NEW ENTRIES ────────────────────────────────────────────────────────────

  "Tuberculosis (TB)": {
    symptoms: ["persistent cough", "chest pain", "fever", "blood in sputum", "weight loss", "night sweats", "fatigue"],
    uniqueSymptoms: ["blood in sputum", "night sweats", "persistent cough lasting 3+ weeks"],
    suggestion: "Seek immediate medical attention. TB is treatable but requires a full course of antibiotics (6–9 months). Do not stop treatment early.",
    homeCare: ["Rest adequately and eat nutritious meals", "Keep living area well-ventilated", "Cover mouth when coughing", "Take medications exactly as prescribed"],
    precautions: ["Isolate from others, especially children and elderly", "Wear a mask in enclosed spaces", "Ensure good ventilation in your home", "Inform close contacts to get tested"],
    urgency: "high",
    tasks: ["Visit a doctor or TB clinic immediately for sputum test and chest X-ray", "Start DOTS (Directly Observed Treatment) program", "Notify close contacts for screening"],
    recommendedFoods: ["High-protein foods (eggs, fish, lean meat, lentils)", "Vitamin D-rich foods (fortified milk, egg yolks, mushrooms)", "Calorie-dense foods to prevent weight loss", "Fresh fruits and vegetables for immunity", "Whole grains and legumes", "Warm soups and broths"],
    foodsToAvoid: ["Alcohol (interferes with TB medications)", "Tobacco in any form", "Raw or undercooked meat", "High-sugar and junk foods that weaken immunity"],
    doctorVisitAdvice: "⚠️ Visit a doctor or government TB center immediately. TB is notifiable and free treatment is available under RNTCP/NTEP. Do not delay — untreated TB can be fatal and spread to others.",
  },

  "Typhoid": {
    symptoms: ["high fever", "headache", "weakness", "fatigue", "diarrhea", "dry cough", "muscle aches", "abdominal pain"],
    uniqueSymptoms: ["sustained high fever (103–104°F)", "rose-colored spots on abdomen", "relative bradycardia"],
    suggestion: "Seek medical attention promptly. Typhoid requires antibiotic treatment. Stay hydrated and follow a soft, easily digestible diet.",
    homeCare: ["Stay well hydrated with ORS, coconut water, and clear soups", "Rest completely", "Sponge bath to manage high fever", "Eat only soft, easily digestible foods"],
    precautions: ["Drink only boiled or bottled water", "Avoid street food and raw vegetables", "Wash hands thoroughly before meals", "Maintain strict personal hygiene"],
    urgency: "high",
    tasks: ["Consult a doctor immediately for Widal test and blood culture", "Complete the full antibiotic course as prescribed", "Isolate to prevent spreading infection"],
    recommendedFoods: ["Boiled rice and khichdi", "Bananas and boiled potatoes", "Boiled vegetables", "Clear vegetable broth", "Coconut water and ORS", "Soft fruit like papaya and watermelon"],
    foodsToAvoid: ["Spicy and oily foods", "Raw vegetables and salads", "Dairy products (during acute phase)", "Carbonated drinks", "Fried and processed foods", "High-fiber foods (can irritate intestines)"],
    doctorVisitAdvice: "⚠️ Consult a doctor within 1 day. Typhoid requires prescription antibiotics. If fever remains above 103°F for more than 3 days or you develop severe abdominal pain, go to a hospital immediately — intestinal perforation is a risk.",
  },

  "Malaria": {
    symptoms: ["fever", "chills", "headache", "nausea", "vomiting", "muscle fatigue", "sweating", "cyclic fever episodes"],
    uniqueSymptoms: ["cyclic fever with chills and sweating", "high fever spikes every 48–72 hours"],
    suggestion: "Seek immediate medical diagnosis with a blood smear or rapid diagnostic test. Malaria requires prompt antimalarial treatment.",
    homeCare: ["Rest completely and stay warm during chills", "Drink plenty of fluids to prevent dehydration", "Use fever-reducing measures (cool compress, fan)", "Take prescribed medications on schedule without missing doses"],
    precautions: ["Sleep under mosquito nets", "Use mosquito repellents (DEET-based)", "Wear long-sleeved clothing at dusk and dawn", "Eliminate stagnant water around the home"],
    urgency: "high",
    tasks: ["Visit a doctor or diagnostic center for malaria blood test immediately", "Start antimalarial treatment within 24 hours of diagnosis", "Complete full medication course even if feeling better"],
    recommendedFoods: ["Easy-to-digest foods like rice, dal, and khichdi", "Fresh fruits (papaya, oranges, guava)", "Coconut water and ORS for hydration", "Vegetable soups and broths", "Ginger tea to ease nausea", "Turmeric milk for immunity"],
    foodsToAvoid: ["Spicy and oily foods", "Alcohol (interacts with antimalarial drugs)", "Fried and heavy foods", "Unboiled or untreated water", "Street food during illness"],
    doctorVisitAdvice: "⚠️ Go to a doctor or hospital immediately — malaria can progress rapidly to severe disease. If you develop confusion, seizures, difficulty breathing, or pass very little urine, go to the emergency room right away.",
  },

  "AIDS/HIV": {
    symptoms: ["unexplained weight loss", "prolonged fever", "skin rashes", "recurrent infections", "mouth sores", "chronic diarrhea", "fatigue", "swollen lymph nodes"],
    uniqueSymptoms: ["recurrent opportunistic infections", "unexplained rapid weight loss", "oral thrush"],
    suggestion: "Consult a doctor for HIV testing. With antiretroviral therapy (ART), HIV is manageable. Early diagnosis significantly improves quality of life.",
    homeCare: ["Take ART medications strictly as prescribed", "Eat a nutritious balanced diet to support immunity", "Avoid infections by practicing strict hygiene", "Stay physically active within your comfort level"],
    precautions: ["Practice safe sex and use condoms consistently", "Do not share needles or syringes", "Inform your healthcare provider of HIV status", "Get vaccinated against preventable illnesses"],
    urgency: "high",
    tasks: ["Get HIV test (ELISA/Western blot) at a government health center (free and confidential)", "Start ART immediately after diagnosis", "Attend regular CD4 count and viral load monitoring"],
    recommendedFoods: ["High-protein foods (eggs, fish, lean meat, lentils, tofu)", "Vitamin-rich fruits and vegetables", "Whole grains and legumes", "Probiotic-rich foods (yogurt, fermented foods)", "Healthy fats (avocado, nuts, olive oil)", "Zinc-rich foods (pumpkin seeds, chickpeas)"],
    foodsToAvoid: ["Raw or undercooked meat, fish, and eggs", "Unpasteurized dairy", "Alcohol (weakens immunity)", "Street food and food with uncertain hygiene", "Excess sugar and refined carbohydrates"],
    doctorVisitAdvice: "⚠️ Consult a doctor or visit a government ART center immediately for confidential testing and treatment. HIV is not a death sentence — with ART, people live full, healthy lives. Free treatment and counseling are available across India.",
  },

  "Anemia": {
    symptoms: ["fatigue", "weakness", "pale or yellowish skin", "shortness of breath", "cold hands and feet", "irregular heartbeat", "dizziness", "headache"],
    uniqueSymptoms: ["pale skin and conjunctiva", "spoon-shaped nails (koilonychia)", "pica (craving non-food items)"],
    suggestion: "Consult a doctor for a complete blood count (CBC) test. Increase iron and vitamin-rich foods in your diet. Iron supplements may be prescribed.",
    homeCare: ["Eat iron-rich foods at every meal", "Pair iron foods with vitamin C to improve absorption", "Avoid tea/coffee immediately after meals", "Rest when fatigued"],
    precautions: ["Do not self-medicate with iron supplements without testing", "Get regular blood tests if you have chronic anemia", "Women of childbearing age should monitor iron levels regularly"],
    urgency: "moderate",
    tasks: ["Get a CBC blood test done within 1–2 days", "Consult a doctor or hematologist for diagnosis", "Review diet and begin iron-rich meal planning"],
    recommendedFoods: ["Spinach, kale, and dark leafy greens (iron-rich)", "Lean red meat and liver (heme iron)", "Lentils, beans, and chickpeas", "Fortified cereals and brown rice", "Pumpkin seeds and tofu", "Vitamin C foods (amla, oranges, guava) to enhance absorption"],
    foodsToAvoid: ["Tea and coffee immediately after meals (inhibit iron absorption)", "Calcium-rich foods at the same time as iron (competes for absorption)", "Phytate-rich foods (raw bran) in excess", "Alcohol"],
    doctorVisitAdvice: "Consult a doctor within 2–3 days for blood work. If you experience chest pain, fainting, or severe shortness of breath due to anemia, seek emergency care immediately.",
  },

  "Dengue Fever": {
    symptoms: ["sudden high fever", "severe headache", "pain behind the eyes", "joint and muscle pain", "rash", "nausea", "vomiting", "fatigue", "mild bleeding (nose or gums)"],
    uniqueSymptoms: ["severe pain behind the eyes", "dengue rash (red blotches)", "sudden drop in platelet count"],
    suggestion: "See a doctor immediately for blood tests. There is no specific drug — management focuses on hydration and monitoring. Watch for warning signs of severe dengue.",
    homeCare: ["Stay well hydrated — drink ORS, coconut water, and juices", "Rest completely", "Take only paracetamol for fever (NEVER aspirin or ibuprofen)", "Monitor for warning signs: bleeding, severe abdominal pain, persistent vomiting"],
    precautions: ["Use mosquito repellent and nets, especially during the day", "Eliminate water-collecting containers around the home", "Wear full-sleeved clothing", "Avoid aspirin and NSAIDs completely"],
    urgency: "high",
    tasks: ["Visit a doctor or hospital within 24 hours of suspected symptoms", "Get NS1 antigen and dengue IgM/IgG blood tests", "Monitor platelet count daily if diagnosed"],
    recommendedFoods: ["Papaya leaf juice (may help raise platelet count)", "Coconut water (hydration and electrolytes)", "Pomegranate juice", "Kiwi and guava (vitamin C)", "Clear vegetable broth and soups", "Soft, easily digestible foods like khichdi and rice"],
    foodsToAvoid: ["Oily and fried foods", "Spicy foods", "Dark-colored foods (can mask internal bleeding signs)", "Caffeinated drinks", "Aspirin and ibuprofen-containing products"],
    doctorVisitAdvice: "⚠️ Consult a doctor within 24 hours. Dengue can rapidly progress to severe dengue with internal bleeding and organ failure. If you have persistent vomiting, blood in vomit/stool/urine, severe abdominal pain, or difficulty breathing — go to the emergency room immediately.",
  },

  "Asthma": {
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "persistent cough", "coughing at night or early morning"],
    uniqueSymptoms: ["wheezing (whistling sound while breathing)", "episodic shortness of breath triggered by allergens or exercise"],
    suggestion: "Use your prescribed inhaler as directed. Avoid known triggers. Consult a pulmonologist for a long-term management plan.",
    homeCare: ["Keep rescue inhaler accessible at all times", "Use a peak flow meter to monitor breathing", "Avoid triggers (dust, smoke, pet dander, cold air)", "Practice breathing exercises like pursed-lip breathing"],
    precautions: ["Avoid smoking and second-hand smoke", "Keep home dust-free with regular cleaning", "Use dust-mite-proof mattress covers", "Avoid outdoor activity on high-pollution or high-pollen days"],
    urgency: "moderate",
    tasks: ["Consult a pulmonologist for an asthma action plan", "Keep a trigger diary", "Ensure rescue inhaler is always with you"],
    recommendedFoods: ["Vitamin D-rich foods (egg yolks, fortified milk)", "Magnesium-rich foods (spinach, almonds, avocado)", "Omega-3 rich foods (salmon, flaxseeds)", "Ginger and turmeric (anti-inflammatory)", "Apples and tomatoes (linked to better lung function)", "Warm herbal teas"],
    foodsToAvoid: ["Sulfite-containing foods (wine, dried fruits, pickles)", "Processed and packaged foods with preservatives", "Cold beverages", "Gas-producing foods if they worsen symptoms", "Allergen foods specific to the individual"],
    doctorVisitAdvice: "Consult a doctor regularly for asthma management. If you experience a severe attack where your rescue inhaler provides no relief, lips turn blue, or you cannot speak in full sentences — call emergency services immediately.",
  },

  "Stroke": {
    symptoms: ["sudden loss of balance", "sudden severe headache", "facial drooping on one side", "arm weakness or numbness", "leg weakness", "slurred speech", "confusion", "vision problems in one or both eyes"],
    uniqueSymptoms: ["sudden facial drooping", "sudden arm weakness (one side)", "sudden slurred or lost speech"],
    suggestion: "⚠️ STROKE IS A MEDICAL EMERGENCY. Call emergency services (102/108 in India) immediately. Every minute counts — act FAST.",
    homeCare: ["Do NOT give food or water to a suspected stroke patient", "Lay the person on their side if unconscious", "Keep them calm and do not leave them alone", "Note the exact time symptoms began (critical for treatment)"],
    precautions: ["Manage blood pressure, diabetes, and cholesterol proactively", "Quit smoking", "Limit alcohol consumption", "Exercise regularly and maintain a healthy weight"],
    urgency: "high",
    tasks: ["Call emergency services (102/108) immediately", "Use FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call emergency", "Get to a stroke-capable hospital within 4.5 hours for clot-busting therapy"],
    recommendedFoods: ["(Post-recovery) Mediterranean diet: olive oil, fish, vegetables, fruits", "Potassium-rich foods (bananas, sweet potatoes)", "Whole grains and legumes", "Dark leafy greens (folate-rich)", "Berries and citrus (antioxidant-rich)", "Fatty fish (omega-3)"],
    foodsToAvoid: ["High-sodium processed foods", "Saturated and trans fats", "Alcohol in excess", "Sugary beverages", "Red and processed meats"],
    doctorVisitAdvice: "⚠️ EMERGENCY: Call 102 or 108 immediately. Do not wait. Stroke treatment (thrombolysis) is most effective within 4.5 hours of symptom onset. Getting to hospital fast can mean the difference between recovery and permanent disability.",
  },

  "Pneumonia": {
    symptoms: ["cough with mucus or blood-tinged sputum", "high fever", "shaking chills", "shortness of breath", "chest pain when breathing", "fatigue", "nausea", "confusion (in elderly)"],
    uniqueSymptoms: ["productive cough with colored sputum", "high fever with chills", "chest pain worsened by breathing or coughing"],
    suggestion: "Seek medical attention promptly. Pneumonia often requires antibiotics or antivirals. Do not delay treatment, especially in children, elderly, or immunocompromised individuals.",
    homeCare: ["Rest completely", "Stay well hydrated with warm fluids", "Use a humidifier to ease breathing", "Sleep with head slightly elevated", "Take prescribed medications on schedule"],
    precautions: ["Avoid smoking", "Stay away from sick individuals", "Get pneumococcal and flu vaccines", "Wash hands frequently"],
    urgency: "high",
    tasks: ["See a doctor within 24 hours for chest X-ray and diagnosis", "Complete the full antibiotic course", "Return for a follow-up X-ray if prescribed"],
    recommendedFoods: ["Warm clear broths and soups", "Turmeric milk (anti-inflammatory)", "Honey and ginger tea", "Vitamin C-rich fruits (guava, kiwi, oranges)", "Protein-rich foods (eggs, lentils, fish) for recovery", "Warm water with lemon"],
    foodsToAvoid: ["Cold beverages and ice cream", "Fried and processed foods", "Excessive dairy (may increase mucus)", "Alcohol (weakens immunity)", "Sugary foods"],
    doctorVisitAdvice: "⚠️ Consult a doctor within 24 hours. If you experience extreme difficulty breathing, coughing up blood, chest pain that won't stop, or blue lips — go to the emergency room immediately. Pneumonia can be life-threatening without proper treatment.",
  },

  "Thyroid Disorder": {
    symptoms: ["fatigue", "unexplained weight change", "mood changes", "weakness", "tremors", "hair loss", "intolerance to cold or heat", "irregular heartbeat", "depression or anxiety"],
    uniqueSymptoms: ["unexplained weight gain (hypothyroid) or weight loss (hyperthyroid)", "cold intolerance or heat intolerance", "goiter (swelling in neck)"],
    suggestion: "Consult a doctor for thyroid function tests (TSH, T3, T4). Thyroid disorders are manageable with medication. Do not self-medicate.",
    homeCare: ["Take thyroid medication at the same time every day on an empty stomach", "Maintain a consistent, balanced diet", "Exercise regularly (yoga and walking are beneficial)", "Manage stress through meditation and relaxation"],
    precautions: ["Avoid taking thyroid medication with calcium or iron supplements (take 4 hours apart)", "Get thyroid levels checked every 3–6 months", "Avoid raw cruciferous vegetables in excess if hypothyroid"],
    urgency: "moderate",
    tasks: ["Get TSH, Free T3, Free T4 blood tests done", "Consult an endocrinologist", "Monitor weight and energy levels weekly"],
    recommendedFoods: ["Iodine-rich foods (iodized salt, seafood, dairy) — for hypothyroid", "Selenium-rich foods (Brazil nuts, sunflower seeds, mushrooms)", "Zinc-rich foods (pumpkin seeds, chickpeas)", "Lean proteins and whole grains", "Anti-inflammatory foods (turmeric, ginger)", "Fresh fruits and vegetables"],
    foodsToAvoid: ["Excess raw cruciferous vegetables (broccoli, cabbage, kale) if hypothyroid", "Soy products in excess (may interfere with thyroid hormone)", "Gluten (if autoimmune thyroid disease is present)", "Processed foods with excess iodine", "Alcohol and tobacco"],
    doctorVisitAdvice: "Consult an endocrinologist within 1 week for proper testing. If you develop sudden severe chest pain, extreme difficulty breathing, or a very swollen neck (thyroid storm or large goiter), seek emergency care immediately.",
  },

  "Liver Disease (Cirrhosis)": {
    symptoms: ["yellowing of skin and eyes (jaundice)", "abdominal pain and swelling (ascites)", "persistent fatigue", "nausea", "dark urine", "pale stools", "easy bruising", "spider-like blood vessels on skin"],
    uniqueSymptoms: ["jaundice (yellowing of skin/eyes)", "ascites (abdominal fluid buildup)", "spider angiomas on skin"],
    suggestion: "Consult a hepatologist or gastroenterologist immediately. Avoid all alcohol. Cirrhosis requires ongoing medical management to slow progression.",
    homeCare: ["Stop all alcohol consumption completely and permanently", "Follow a low-sodium diet to reduce fluid retention", "Eat small, frequent meals", "Avoid all over-the-counter pain medications (especially paracetamol and NSAIDs) without doctor approval"],
    precautions: ["Do not consume any alcohol — ever", "Avoid raw shellfish (risk of bacterial infection)", "Get vaccinated for Hepatitis A and B", "Avoid herbal supplements that may harm the liver"],
    urgency: "high",
    tasks: ["Consult a hepatologist or gastroenterologist within 1–2 days", "Get liver function tests, ultrasound, and fibroscan done", "Begin sodium-restricted diet immediately"],
    recommendedFoods: ["Lean protein (eggs, fish, poultry in moderation)", "Fresh vegetables (beets, leafy greens, cruciferous vegetables)", "Whole grains (oats, brown rice, quinoa)", "Low-sodium foods", "Berries and antioxidant-rich fruits", "Coffee (studies show it may protect the liver)"],
    foodsToAvoid: ["Alcohol — strictly and completely", "Raw or undercooked shellfish and meat", "High-sodium foods (pickles, chips, canned foods)", "Fried and fatty foods", "Excess red meat", "Herbal supplements not approved by your doctor"],
    doctorVisitAdvice: "⚠️ Consult a hepatologist within 1–2 days. If you experience sudden severe abdominal pain, vomiting blood, extreme confusion, or loss of consciousness — go to the emergency room immediately. These may indicate serious complications like variceal bleeding or hepatic encephalopathy.",
  },

  "Diabetes": {
    symptoms: ["unexplained weight loss", "fatigue", "increased thirst", "blurry vision", "frequent urination", "slow-healing wounds", "frequent infections", "tingling in hands and feet"],
    uniqueSymptoms: ["excessive thirst (polydipsia)", "frequent urination (polyuria)", "slow-healing sores"],
    suggestion: "Consult a doctor for blood glucose and HbA1c testing. Diabetes is manageable with diet, exercise, and medication. Early control prevents serious complications.",
    homeCare: ["Monitor blood sugar before and after meals", "Eat balanced meals at fixed times", "Exercise for at least 30 minutes daily", "Stay well hydrated with water"],
    precautions: ["Check feet daily for wounds or infections", "Get regular eye and kidney checkups", "Never skip prescribed diabetes medications", "Avoid high-glycemic index foods"],
    urgency: "high",
    tasks: ["Get fasting blood sugar and HbA1c tests done", "Consult a diabetologist or endocrinologist", "Start a low-GI meal plan with a dietitian"],
    recommendedFoods: ["Non-starchy vegetables (bitter gourd, spinach, broccoli, cauliflower)", "Whole grains (brown rice, oats, millet)", "Lean protein (lentils, fish, grilled chicken)", "Nuts and seeds (almonds, chia seeds, flaxseeds)", "Berries in moderation", "Fenugreek (methi) — helps lower blood sugar"],
    foodsToAvoid: ["White rice, white bread, and refined flour (maida)", "Sugary beverages (soda, packaged juices)", "Sweets, desserts, and mithai", "Fried and processed snacks", "High-GI fruits in excess (mango, banana, grapes)"],
    doctorVisitAdvice: "⚠️ Consult a doctor within 1–2 days for testing. If you experience extreme weakness, fruity breath, confusion, or are unable to keep fluids down — visit a hospital immediately as these may indicate a diabetic emergency (DKA or HHS).",
  },

  "Heart Disease": {
    symptoms: ["chest pain or discomfort (angina)", "shortness of breath", "pain radiating to arm, neck, jaw, or back", "nausea", "dizziness", "extreme fatigue", "palpitations", "swelling in legs or ankles"],
    uniqueSymptoms: ["chest pain (pressure, squeezing, or tightening)", "pain radiating to left arm or jaw", "sudden cold sweat with chest discomfort"],
    suggestion: "Seek medical attention immediately for chest pain. Heart disease requires lifestyle changes, medications, and regular cardiology follow-up.",
    homeCare: ["Follow a heart-healthy diet (low sodium, low saturated fat)", "Exercise as advised by your cardiologist", "Monitor blood pressure and cholesterol regularly", "Take all prescribed medications without skipping"],
    precautions: ["Stop smoking immediately", "Limit alcohol strictly", "Manage blood pressure, diabetes, and cholesterol", "Maintain a healthy body weight"],
    urgency: "high",
    tasks: ["Consult a cardiologist immediately", "Get ECG, echocardiogram, and lipid profile tests", "Begin a cardiac rehabilitation program if advised"],
    recommendedFoods: ["Fatty fish (salmon, mackerel — omega-3 rich)", "Whole grains (oats, whole wheat, barley)", "Fruits and vegetables (especially berries, leafy greens)", "Nuts (walnuts, almonds)", "Olive oil and avocado (healthy fats)", "Legumes (lentils, chickpeas, kidney beans)"],
    foodsToAvoid: ["Saturated and trans fats (butter, ghee in excess, fried food)", "High-sodium foods (chips, pickles, processed meats)", "Red and processed meats", "Sugary beverages and desserts", "Alcohol in excess", "Full-fat dairy in excess"],
    doctorVisitAdvice: "⚠️ If you experience sudden severe chest pain, pain spreading to your arm or jaw, sudden shortness of breath, or cold sweat — call 102/108 immediately. This may be a heart attack. Do not drive yourself — call for emergency help.",
  },

  "Kidney Disease": {
    symptoms: ["fatigue", "swollen ankles and feet", "foamy or bubbly urine", "dry or itchy skin", "increased or decreased urination", "blood in urine", "difficulty concentrating", "loss of appetite", "muscle cramps"],
    uniqueSymptoms: ["foamy urine (protein leakage)", "swollen ankles and face in the morning", "decreased urine output in advanced disease"],
    suggestion: "Consult a nephrologist for kidney function tests. Managing blood pressure, blood sugar, and diet is key to slowing kidney disease progression.",
    homeCare: ["Drink adequate water (consult doctor on the right amount)", "Follow a kidney-friendly diet (low sodium, low potassium if advised)", "Monitor blood pressure daily", "Take prescribed medications consistently"],
    precautions: ["Avoid NSAIDs and painkillers like ibuprofen and aspirin", "Do not use contrast dye in scans without nephrologist approval", "Avoid high-protein diets without medical guidance", "Keep blood pressure and blood sugar strictly controlled"],
    urgency: "high",
    tasks: ["Get serum creatinine, eGFR, urine ACR, and blood pressure checked", "Consult a nephrologist within 2–3 days", "Review and adjust all medications with your doctor"],
    recommendedFoods: ["Cauliflower, cabbage, and garlic (kidney-friendly vegetables)", "Red grapes and cranberries (antioxidant-rich)", "Egg whites (high-quality protein, low phosphorus)", "Olive oil", "White rice and white bread (lower potassium/phosphorus than whole grain, if potassium is restricted)", "Apples and blueberries"],
    foodsToAvoid: ["High-potassium foods if restricted (bananas, oranges, potatoes, tomatoes)", "High-phosphorus foods (dairy, nuts, dark colas, processed foods)", "High-sodium foods (pickles, chips, salty snacks)", "Excess protein (red meat, protein supplements)", "NSAIDs and herbal supplements without doctor approval"],
    doctorVisitAdvice: "⚠️ Consult a nephrologist within 2–3 days. If you experience sudden decrease in urine output, severe swelling, confusion, difficulty breathing, or blood in urine — go to a hospital immediately as these may indicate acute kidney failure.",
  },
};

const allSymptoms = Array.from(
  new Set(Object.values(diseaseDatabase).flatMap((d) => d.symptoms))
).sort();

export const getAllSymptoms = () => allSymptoms;

// Count how many diseases share each symptom (for inverse frequency weighting)
const symptomFrequency: Record<string, number> = {};
for (const data of Object.values(diseaseDatabase)) {
  for (const s of data.symptoms) {
    symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
  }
}
const totalDiseases = Object.keys(diseaseDatabase).length;

export interface PredictionResult {
  disease: string;
  confidence: number;
  suggestion: string;
  explanation: string[];
  homeCare: string[];
  precautions: string[];
  urgency: "low" | "moderate" | "high";
  tasks: string[];
  matchedCommon: string[];
  matchedUnique: string[];
  recommendedFoods: string[];
  foodsToAvoid: string[];
  doctorVisitAdvice: string;
}

export const predictDisease = (selectedSymptoms: string[]): PredictionResult[] => {
  const lower = selectedSymptoms.map((s) => s.toLowerCase());
  const results: (PredictionResult & { rawScore: number; maxScore: number })[] = [];

  for (const [disease, data] of Object.entries(diseaseDatabase)) {
    const matched = data.symptoms.filter((s) => lower.includes(s.toLowerCase()));
    if (matched.length === 0) continue;

    const matchedCommon: string[] = [];
    const matchedUnique: string[] = [];

    let weightedScore = 0;
    let maxPossibleScore = 0;

    for (const symptom of data.symptoms) {
      const isUnique = data.uniqueSymptoms.includes(symptom);
      const isCommon = COMMON_SYMPTOMS.has(symptom.toLowerCase());

      // Inverse document frequency: rarer symptoms across all diseases = higher weight
      const idf = Math.log(totalDiseases / (symptomFrequency[symptom] || 1)) + 1;

      let weight: number;
      if (isUnique) {
        weight = SYMPTOM_WEIGHT.unique * idf;
      } else if (isCommon) {
        weight = SYMPTOM_WEIGHT.common * idf;
      } else {
        weight = SYMPTOM_WEIGHT.moderate * idf;
      }

      maxPossibleScore += weight;

      if (lower.includes(symptom.toLowerCase())) {
        weightedScore += weight;
        if (isCommon) matchedCommon.push(symptom);
        else matchedUnique.push(symptom);
      }
    }

    // Penalize if ONLY common symptoms matched (no unique ones)
    if (matchedUnique.length === 0 && matchedCommon.length > 0) {
      weightedScore *= 0.4; // heavy penalty
    }

    // Bonus for matching multiple unique symptoms
    if (matchedUnique.length >= 2) {
      weightedScore *= 1.2;
    }

    const confidence = Math.min(95, Math.round((weightedScore / maxPossibleScore) * 100));

    const explanation = [
      ...matchedUnique.map((s) => `Key symptom "${s}" is a strong indicator of ${disease}`),
      ...matchedCommon.map((s) => `Common symptom "${s}" provides supporting evidence`),
    ];

    if (matchedUnique.length === 0) {
      explanation.push(`⚠️ No disease-specific symptoms matched — confidence is reduced`);
    }

    results.push({
      disease,
      confidence,
      suggestion: data.suggestion,
      explanation,
      homeCare: data.homeCare,
      precautions: data.precautions,
      urgency: data.urgency,
      tasks: data.tasks,
      matchedCommon,
      matchedUnique,
      recommendedFoods: data.recommendedFoods,
      foodsToAvoid: data.foodsToAvoid,
      doctorVisitAdvice: data.doctorVisitAdvice,
      rawScore: weightedScore,
      maxScore: maxPossibleScore,
    });
  }

  results.sort((a, b) => b.confidence - a.confidence);

  return results.slice(0, 3).map(({ rawScore, maxScore, ...r }) => r);
};

// History management
export const getHistory = (): PredictionRecord[] => {
  return JSON.parse(localStorage.getItem("health_history") || "[]");
};

export const addToHistory = (record: Omit<PredictionRecord, "id" | "date" | "completed">) => {
  const history = getHistory();
  history.unshift({
    ...record,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    completed: false,
  });
  localStorage.setItem("health_history", JSON.stringify(history));
};

export const toggleComplete = (id: string) => {
  const history = getHistory();
  const updated = history.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h));
  localStorage.setItem("health_history", JSON.stringify(updated));
};

export const toggleTask = (recordId: string, taskIndex: number) => {
  const history = getHistory();
  const updated = history.map((h) => {
    if (h.id === recordId && h.tasks) {
      const newTasks = [...h.tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], done: !newTasks[taskIndex].done };
      const allDone = newTasks.every((t) => t.done);
      return { ...h, tasks: newTasks, completed: allDone };
    }
    return h;
  });
  localStorage.setItem("health_history", JSON.stringify(updated));
};
