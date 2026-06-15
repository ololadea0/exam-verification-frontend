const defaultCourses = [
  { course_code: "GST101", course_title: "Use of English" },
  { course_code: "GST102", course_title: "Nigerian Peoples and Culture" },
  { course_code: "GST103", course_title: "Communication Skills" },
  { course_code: "GST104", course_title: "Entrepreneurship Studies" },
];

const courseGroups = [
  {
    match: ["computer science"],
    courses: [
      { course_code: "CSC301", course_title: "Data Structures and Algorithms" },
      { course_code: "CSC302", course_title: "Database Management Systems" },
      { course_code: "CSC401", course_title: "Artificial Intelligence" },
      { course_code: "CSC402", course_title: "Software Engineering" },
      { course_code: "CSC405", course_title: "Computer Networks" },
    ],
  },
  {
    match: ["cyber security"],
    courses: [
      { course_code: "CYB301", course_title: "Network Security" },
      { course_code: "CYB302", course_title: "Cryptography" },
      { course_code: "CYB401", course_title: "Ethical Hacking" },
      { course_code: "CYB402", course_title: "Digital Forensics" },
      { course_code: "CYB405", course_title: "Security Risk Management" },
    ],
  },
  {
    match: ["information systems"],
    courses: [
      { course_code: "IFS301", course_title: "Systems Analysis and Design" },
      { course_code: "IFS302", course_title: "Enterprise Information Systems" },
      { course_code: "IFS401", course_title: "Business Intelligence" },
      { course_code: "IFS402", course_title: "Information Systems Strategy" },
      { course_code: "IFS405", course_title: "IT Project Management" },
    ],
  },
  {
    match: ["engineering"],
    courses: [
      { course_code: "ENG301", course_title: "Engineering Mathematics" },
      { course_code: "ENG302", course_title: "Engineering Design" },
      { course_code: "ENG401", course_title: "Control Systems" },
      { course_code: "ENG402", course_title: "Project Management" },
      { course_code: "ENG405", course_title: "Engineering Ethics" },
    ],
  },
  {
    match: ["accounting"],
    courses: [
      { course_code: "ACC301", course_title: "Financial Accounting" },
      { course_code: "ACC302", course_title: "Cost Accounting" },
      { course_code: "ACC401", course_title: "Auditing and Assurance" },
      { course_code: "ACC402", course_title: "Taxation" },
      { course_code: "ACC405", course_title: "Public Sector Accounting" },
    ],
  },
  {
    match: ["business management", "marketing", "transport management"],
    courses: [
      { course_code: "MGT301", course_title: "Principles of Management" },
      { course_code: "MGT302", course_title: "Organizational Behaviour" },
      { course_code: "MGT401", course_title: "Strategic Management" },
      { course_code: "MKT301", course_title: "Consumer Behaviour" },
      { course_code: "MKT401", course_title: "Marketing Management" },
    ],
  },
  {
    match: ["economics"],
    courses: [
      { course_code: "ECO301", course_title: "Microeconomic Theory" },
      { course_code: "ECO302", course_title: "Macroeconomic Theory" },
      { course_code: "ECO401", course_title: "Econometrics" },
      { course_code: "ECO402", course_title: "Development Economics" },
      { course_code: "ECO405", course_title: "International Economics" },
    ],
  },
  {
    match: ["mass communication", "english", "history", "political science", "sociology"],
    courses: [
      { course_code: "SOC301", course_title: "Research Methods" },
      { course_code: "POL301", course_title: "Public Administration" },
      { course_code: "MAC301", course_title: "News Writing and Reporting" },
      { course_code: "ENG301", course_title: "Advanced Composition" },
      { course_code: "HIS301", course_title: "African History" },
    ],
  },
  {
    match: ["biology", "chemistry", "physics", "mathematics", "statistics", "biochemistry"],
    courses: [
      { course_code: "SCI301", course_title: "Research Methodology" },
      { course_code: "BIO301", course_title: "Cell Biology" },
      { course_code: "CHM301", course_title: "Organic Chemistry" },
      { course_code: "PHY301", course_title: "Modern Physics" },
      { course_code: "STA301", course_title: "Statistical Inference" },
    ],
  },
  {
    match: ["medical", "medicine", "nursing", "anatomy", "physiology", "pharmacology"],
    courses: [
      { course_code: "BMS301", course_title: "Human Anatomy" },
      { course_code: "BMS302", course_title: "Human Physiology" },
      { course_code: "NUR301", course_title: "Medical Surgical Nursing" },
      { course_code: "MED401", course_title: "Clinical Methods" },
      { course_code: "PHA401", course_title: "Pharmacology" },
    ],
  },
  {
    match: ["agricultural", "crop", "animal", "aquaculture", "forest", "wildlife"],
    courses: [
      { course_code: "AGR301", course_title: "Agricultural Extension" },
      { course_code: "AGR302", course_title: "Soil Science" },
      { course_code: "AGR401", course_title: "Farm Management" },
      { course_code: "ANS301", course_title: "Animal Production" },
      { course_code: "CRP301", course_title: "Crop Production" },
    ],
  },
  {
    match: ["architecture", "building", "estate", "surveying", "urban"],
    courses: [
      { course_code: "ENV301", course_title: "Environmental Design" },
      { course_code: "ARC301", course_title: "Architectural Design" },
      { course_code: "BLD301", course_title: "Building Construction" },
      { course_code: "SVG301", course_title: "Geospatial Surveying" },
      { course_code: "URP301", course_title: "Urban Planning Studio" },
    ],
  },
  {
    match: ["food", "nutrition", "hospitality", "consumer"],
    courses: [
      { course_code: "FST301", course_title: "Food Chemistry" },
      { course_code: "FST302", course_title: "Food Processing" },
      { course_code: "NTD301", course_title: "Human Nutrition" },
      { course_code: "HMT301", course_title: "Hospitality Operations" },
      { course_code: "CHE301", course_title: "Consumer Studies" },
    ],
  },
];

export const getCourseOptionsForDepartment = (department = "") => {
  const normalizedDepartment = department.toLowerCase();
  const matchedGroup = courseGroups.find((group) =>
    group.match.some((keyword) => normalizedDepartment.includes(keyword)),
  );

  return (matchedGroup?.courses || defaultCourses).slice(0, 10);
};

export default courseGroups;
