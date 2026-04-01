// Curated list of well-known pharmaceutical compounds for PubChem lookups
export const DRUG_NAMES = [
  // Cardiovascular
  'Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin', 'Losartan',
  'Amlodipine', 'Metoprolol', 'Lisinopril', 'Clopidogrel', 'Warfarin',
  // Pain / Anti-inflammatory
  'Aspirin', 'Ibuprofen', 'Naproxen', 'Celecoxib', 'Diclofenac',
  'Acetaminophen', 'Meloxicam', 'Indomethacin', 'Piroxicam', 'Ketorolac',
  // CNS / Psychiatric
  'Sertraline', 'Fluoxetine', 'Escitalopram', 'Bupropion', 'Venlafaxine',
  'Duloxetine', 'Trazodone', 'Gabapentin', 'Pregabalin', 'Lamotrigine',
  // Oncology
  'Imatinib', 'Erlotinib', 'Gefitinib', 'Sorafenib', 'Sunitinib',
  'Tamoxifen', 'Doxorubicin', 'Cisplatin', 'Paclitaxel', 'Methotrexate',
  'Vemurafenib', 'Dabrafenib', 'Olaparib', 'Palbociclib', 'Lapatinib',
  // Metabolic
  'Metformin', 'Glipizide', 'Pioglitazone', 'Sitagliptin', 'Empagliflozin',
  // GI
  'Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Ranitidine', 'Ondansetron',
  // Respiratory
  'Montelukast', 'Albuterol', 'Fluticasone', 'Theophylline', 'Tiotropium',
  // Anti-infective
  'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Doxycycline', 'Fluconazole',
  'Oseltamivir', 'Acyclovir', 'Rifampin', 'Isoniazid', 'Levofloxacin',
  // Miscellaneous
  'Sildenafil', 'Finasteride', 'Levothyroxine', 'Prednisone', 'Hydroxychloroquine',
  'Colchicine', 'Allopurinol', 'Cyclosporine', 'Tacrolimus', 'Mycophenolate',
];

// Well-known ChEMBL target IDs
export const CHEMBL_TARGETS = {
  EGFR: 'CHEMBL203',       // Epidermal Growth Factor Receptor
  COX2: 'CHEMBL230',       // Cyclooxygenase-2
  ACE: 'CHEMBL1808',       // Angiotensin-converting enzyme
  HDAC1: 'CHEMBL325',      // Histone deacetylase 1
  BRAF: 'CHEMBL5145',      // B-Raf kinase
  JAK2: 'CHEMBL2971',      // Janus kinase 2
  VEGFR2: 'CHEMBL279',     // Vascular endothelial growth factor receptor 2
  HER2: 'CHEMBL1824',      // Human epidermal growth factor receptor 2
} as const;
