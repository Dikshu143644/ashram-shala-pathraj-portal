import { useState } from 'react';
import { Book, Box, Database, Globe, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { schoolOverview, capacityInfo, moduleDescriptions, roleMatrix, apiEndpoints } from '../data/prdData';
import { useAppContext } from '../contexts/AppContext';

type PrdTab = 'overview' | 'modules' | 'database' | 'api' | 'roles';

export default function PrdViewer() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<PrdTab>('overview');

  const tabs: { key: PrdTab; label: string; icon: typeof Book }[] = [
    { key: 'overview', label: t('Overview', 'आढावा'), icon: Book },
    { key: 'modules', label: t('Modules', 'मॉड्यूल्स'), icon: Box },
    { key: 'database', label: t('Database', 'डेटाबेस'), icon: Database },
    { key: 'api', label: t('API', 'API'), icon: Globe },
    { key: 'roles', label: t('Roles', 'भूमिका'), icon: Users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
        {t('System Documentation', 'प्रणाली दस्तऐवज')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        {activeTab === 'overview' && <OverviewSection language={language} />}
        {activeTab === 'modules' && <ModulesSection language={language} />}
        {activeTab === 'database' && <DatabaseSection />}
        {activeTab === 'api' && <ApiSection />}
        {activeTab === 'roles' && <RolesSection language={language} />}
      </div>
    </motion.div>
  );
}

function OverviewSection({ language }: { language: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <h3 className="text-lg font-bold text-slate-800 mb-2">
        {language === 'en' ? schoolOverview.name_en : schoolOverview.name_mr}
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        {language === 'en' ? schoolOverview.description_en : schoolOverview.description_mr}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-700 mb-2">School Details</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Department</dt><dd>{language === 'mr' ? schoolOverview.department_mr : schoolOverview.department}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">District</dt><dd>{schoolOverview.district}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Taluka</dt><dd>{schoolOverview.taluka}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Established</dt><dd>{schoolOverview.established}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-700 mb-2">Capacity</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Students</dt><dd>{capacityInfo.total_students}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Standards</dt><dd>{capacityInfo.standards}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Hostel Beds</dt><dd>{capacityInfo.hostel_capacity}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Staff</dt><dd>{capacityInfo.staff_strength}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-slate-700 mb-2">Staff Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {Object.entries(capacityInfo.staff_breakdown).map(([key, val]) => (
            <div key={key} className="flex justify-between bg-white rounded px-2 py-1">
              <span className="text-slate-500 capitalize">{key.replace('_', ' ')}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModulesSection({ language }: { language: string }) {
  return (
    <div className="space-y-4">
      {Object.entries(moduleDescriptions).map(([key, mod]) => (
        <div key={key} className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-slate-800 mb-1">
            {language === 'mr' ? mod.title_mr : mod.title_en}
          </h4>
          <p className="text-sm text-slate-600 mb-3">{mod.description}</p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
            {mod.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DatabaseSection() {
  const schema = `-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY,
  application_no VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  standard ENUM('1st'...'12th'),
  stream ENUM('Arts', 'Science') NULL,
  caste_category ENUM('ST','SC','OBC','NT','SBC','General'),
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  mobile_number VARCHAR(10),
  parent_name VARCHAR(255),
  status ENUM('Submitted','Verified','Approved','Enrolled','Rejected'),
  gender ENUM('Male','Female'),
  hostel_wing VARCHAR(20),
  bed_number INTEGER,
  created_at TIMESTAMP
);

-- Staff Table
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  designation_marathi VARCHAR(100),
  department VARCHAR(50),
  mobile_number VARCHAR(10),
  email VARCHAR(100),
  joining_date DATE,
  role ENUM('principal','teacher','clerk','rector','support','mess_staff')
);

-- Hostel Beds Table
CREATE TABLE hostel_beds (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES hostel_rooms(id),
  bed_number INTEGER,
  student_id UUID REFERENCES students(id),
  status ENUM('occupied','vacant','maintenance')
);

-- Mess Records Table
CREATE TABLE mess_records (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  meal_type ENUM('breakfast','lunch','dinner','snack'),
  date DATE,
  verified BOOLEAN,
  timestamp TIMESTAMP
);`;

  return (
    <div>
      <h3 className="font-bold text-slate-800 mb-3">Database Schema</h3>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre font-mono">
        {schema}
      </pre>
    </div>
  );
}

function ApiSection() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 mb-3">API Endpoints</h3>
      {Object.entries(apiEndpoints).map(([group, endpoints]) => (
        <div key={group} className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-700 mb-2 capitalize">{group}</h4>
          <div className="space-y-1">
            {Object.entries(endpoints).map(([key, endpoint]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">{endpoint}</code>
                <span className="text-xs text-slate-500 capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RolesSection({ language }: { language: string }) {
  return (
    <div>
      <h3 className="font-bold text-slate-800 mb-3">Role Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Role</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Label</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Access</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(roleMatrix).map(([key, role]) => (
              <tr key={key} className="border-t border-slate-200">
                <td className="px-4 py-2 font-mono text-xs">{key}</td>
                <td className="px-4 py-2">{language === 'mr' ? role.label_mr : role.label_en}</td>
                <td className="px-4 py-2 text-xs text-slate-600">{role.access.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
