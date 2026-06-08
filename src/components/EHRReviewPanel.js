'use client';

import { useState, useEffect } from 'react';
import { Check, X, Activity, Pill, AlertTriangle, FileText, Loader2 } from 'lucide-react';

export default function EHRReviewPanel({ extractedData, onApprove, onReject, isLoading }) {
  const [selectedItems, setSelectedItems] = useState({
    vitalSigns: true,
    medications: {},
    allergies: {},
    timeline: {}
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize selections in useEffect to avoid hydration issues
  useEffect(() => {
    if (extractedData && extractedData.hasData && !initialized) {
      const { medications, allergies } = extractedData.extracted;
      const medSelection = {};
      const allergySelection = {};
      
      medications.forEach((_, idx) => medSelection[idx] = true);
      allergies.forEach((_, idx) => allergySelection[idx] = true);
      
      setSelectedItems({
        vitalSigns: true,
        medications: medSelection,
        allergies: allergySelection,
        timeline: {}
      });
      setInitialized(true);
    }
  }, [extractedData, initialized]);

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <p className="text-blue-900 font-medium">Extracting EHR data from note...</p>
        </div>
      </div>
    );
  }

  if (!extractedData || !extractedData.hasData) {
    return null;
  }

  const { vitalSigns, medications, allergies, timeline } = extractedData.extracted;

  const handleApprove = () => {
    // Filter selected items
    const approvedData = {
      vitalSigns: selectedItems.vitalSigns ? vitalSigns : null,
      medications: medications.filter((_, idx) => selectedItems.medications[idx]),
      allergies: allergies.filter((_, idx) => selectedItems.allergies[idx]),
      timeline: timeline.filter((_, idx) => selectedItems.timeline[idx] !== false)
    };
    onApprove(approvedData);
  };

  const handleSelectAll = () => {
    const newSelection = {
      vitalSigns: true,
      medications: {},
      allergies: {},
      timeline: {}
    };
    medications.forEach((_, idx) => newSelection.medications[idx] = true);
    allergies.forEach((_, idx) => newSelection.allergies[idx] = true);
    timeline.forEach((_, idx) => newSelection.timeline[idx] = true);
    setSelectedItems(newSelection);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            EHR Data Detected!
          </h3>
          <p className="text-blue-700 text-sm mt-1">
            Review and approve the extracted data to add to patient's record
          </p>
        </div>
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Select All
        </button>
      </div>

      <div className="space-y-4">
        {/* Vital Signs */}
        {vitalSigns && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedItems.vitalSigns}
                onChange={(e) => setSelectedItems(prev => ({ ...prev, vitalSigns: e.target.checked }))}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-gray-900">Vital Signs</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureDiastolic && (
                    <div>
                      <span className="text-gray-600">BP:</span>
                      <span className="ml-1 font-medium">{vitalSigns.bloodPressureSystolic}/{vitalSigns.bloodPressureDiastolic} mmHg</span>
                    </div>
                  )}
                  {vitalSigns.heartRate && (
                    <div>
                      <span className="text-gray-600">HR:</span>
                      <span className="ml-1 font-medium">{vitalSigns.heartRate} bpm</span>
                    </div>
                  )}
                  {vitalSigns.temperature && (
                    <div>
                      <span className="text-gray-600">Temp:</span>
                      <span className="ml-1 font-medium">{vitalSigns.temperature}°F</span>
                    </div>
                  )}
                  {vitalSigns.weight && (
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-1 font-medium">{vitalSigns.weight} kg</span>
                    </div>
                  )}
                  {vitalSigns.oxygenSaturation && (
                    <div>
                      <span className="text-gray-600">SpO2:</span>
                      <span className="ml-1 font-medium">{vitalSigns.oxygenSaturation}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medications */}
        {medications.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">New Medications ({medications.length})</h4>
            </div>
            <div className="space-y-2">
              {medications.map((med, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.medications[idx]}
                    onChange={(e) => setSelectedItems(prev => ({
                      ...prev,
                      medications: { ...prev.medications, [idx]: e.target.checked }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{med.name}</span>
                    {med.dosage && <span className="text-gray-600"> - {med.dosage}</span>}
                    {med.frequency && <span className="text-gray-600"> ({med.frequency})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">Allergies ({allergies.length})</h4>
            </div>
            <div className="space-y-2">
              {allergies.map((allergy, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.allergies[idx]}
                    onChange={(e) => setSelectedItems(prev => ({
                      ...prev,
                      allergies: { ...prev.allergies, [idx]: e.target.checked }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{allergy.allergen}</span>
                    {allergy.reaction && <span className="text-gray-600"> - {allergy.reaction}</span>}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      allergy.severity === 'severe' ? 'bg-red-100 text-red-700' :
                      allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {allergy.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-blue-200">
        <button
          onClick={handleApprove}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Check className="h-5 w-5" />
          Add Selected to EHR
        </button>
        <button
          onClick={onReject}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
