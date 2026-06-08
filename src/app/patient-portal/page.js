'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Calendar, Activity, User, LogOut, 
  Eye, Download, Clock, AlertCircle, Shield 
} from 'lucide-react';

export default function PatientPortal() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'

  useEffect(() => {
    checkPatientAuth();
  }, []);

  const checkPatientAuth = async () => {
    try {
      const response = await fetch('/api/patient/me');
      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
        loadRecords();
      } else {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    try {
      const response = await fetch('/api/patient/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        console.error('Failed to load records:', await response.text());
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/patient/logout', { method: 'POST' });
    router.push('/signin');
  };

  const viewRecordDetails = async (recordId) => {
    try {
      console.log('Fetching record details for ID:', recordId);
      const response = await fetch(`/api/patient/records/${recordId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Record data received:', data);
        setSelectedRecord(data.record);
        setViewMode('detail');
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch record:', errorData);
        alert('Failed to load record details. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load record details:', error);
      alert('An error occurred while loading the record.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-sm text-gray-500">Secure access to your medical records</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{patient?.name}</h2>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 font-medium text-gray-900">{patient?.age} years</span>
                </div>
                <div>
                  <span className="text-gray-500">Sex:</span>
                  <span className="ml-2 font-medium text-gray-900">{patient?.sex}</span>
                </div>
                <div>
                  <span className="text-gray-500">MRN:</span>
                  <span className="ml-2 font-medium text-gray-900">{patient?.mrn}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Records:</span>
                  <span className="ml-2 font-medium text-gray-900">{records.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your Privacy is Protected</p>
              <p>All medical records are encrypted and only accessible to you and your healthcare providers. 
              Sensitive information is displayed securely and never shared without your consent.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'summary' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Medical Records & Sessions</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>{records.length} session{records.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Yet</h3>
                <p className="text-gray-500">Your medical records will appear here after your appointments.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                    onClick={() => viewRecordDetails(record._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{record.templateName}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.sessionDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {record.sessionTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {record.sessionSummary}
                          </p>
                        </div>

                        {record.icdCodes && record.icdCodes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {record.icdCodes.slice(0, 3).map((code, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                              >
                                {code.code} - {code.description}
                              </span>
                            ))}
                            {record.icdCodes.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{record.icdCodes.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setViewMode('summary');
                setSelectedRecord(null);
              }}
              className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              ← Back to all records
            </button>

            {selectedRecord && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedRecord.templateName}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedRecord.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedRecord.sessionTime}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>

                <div className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Clinical Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedRecord.noteContent || (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No clinical notes available for this session.</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRecord.icdCodes && selectedRecord.icdCodes.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Diagnostic Codes (ICD-10)</h3>
                    <div className="grid gap-3">
                      {selectedRecord.icdCodes.map((code, idx) => (
                        <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <span className="font-mono font-semibold text-purple-700">{code.code}</span>
                            <span className="text-gray-700">{code.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
