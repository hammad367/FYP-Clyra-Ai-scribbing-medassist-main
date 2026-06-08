'use client';

import { useState } from 'react';
import { Pill, AlertTriangle, Activity, Plus, X, Edit2, Trash2, Calendar, TrendingUp } from 'lucide-react';
import Toast from './Toast';

export default function PatientEHRDashboard({ patient, onUpdate }) {
  const [activeTab, setActiveTab] = useState('medications');
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });

  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    reaction: '',
    severity: 'moderate',
    notes: ''
  });

  const [newVitals, setNewVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    respiratoryRate: ''
  });

  const handleAddMedication = async () => {
    if (!newMedication.name) {
      setToast({ message: 'Medication name is required', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patient._id}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedication)
      });

      if (response.ok) {
        setToast({ message: 'Medication added successfully!', type: 'success' });
        setShowAddMedication(false);
        setNewMedication({ name: '', dosage: '', frequency: '', notes: '' });
        onUpdate();
      } else {
        setToast({ message: 'Failed to add medication', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error adding medication', type: 'error' });
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    try {
      const response = await fetch(`/api/patients/${patient._id}/medications`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId })
      });

      if (response.ok) {
        setToast({ message: 'Medication removed', type: 'success' });
        onUpdate();
      } else {
        setToast({ message: 'Failed to remove medication', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error removing medication', type: 'error' });
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.allergen) {
      setToast({ message: 'Allergen name is required', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patient._id}/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllergy)
      });

      if (response.ok) {
        setToast({ message: 'Allergy added successfully!', type: 'success' });
        setShowAddAllergy(false);
        setNewAllergy({ allergen: '', reaction: '', severity: 'moderate', notes: '' });
        onUpdate();
      } else {
        setToast({ message: 'Failed to add allergy', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error adding allergy', type: 'error' });
    }
  };

  const handleDeleteAllergy = async (allergyId) => {
    try {
      const response = await fetch(`/api/patients/${patient._id}/allergies`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergyId })
      });

      if (response.ok) {
        setToast({ message: 'Allergy removed', type: 'success' });
        onUpdate();
      } else {
        setToast({ message: 'Failed to remove allergy', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error removing allergy', type: 'error' });
    }
  };

  const handleAddVitals = async () => {
    const hasAnyVital = Object.values(newVitals).some(v => v !== '');
    if (!hasAnyVital) {
      setToast({ message: 'Please enter at least one vital sign', type: 'error' });
      return;
    }

    try {
      const vitalsData = {};
      Object.keys(newVitals).forEach(key => {
        if (newVitals[key] !== '') {
          vitalsData[key] = parseFloat(newVitals[key]) || newVitals[key];
        }
      });

      const response = await fetch(`/api/patients/${patient._id}/vital-signs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsData)
      });

      if (response.ok) {
        setToast({ message: 'Vital signs added successfully!', type: 'success' });
        setShowAddVitals(false);
        setNewVitals({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          oxygenSaturation: '',
          respiratoryRate: ''
        });
        onUpdate();
      } else {
        setToast({ message: 'Failed to add vital signs', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error adding vital signs', type: 'error' });
    }
  };

  const medications = patient.medications || [];
  const allergies = patient.allergies || [];
  const vitalSigns = patient.vitalSigns || [];
  const timeline = patient.timeline || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 px-6">
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'medications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span>Medications ({medications.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'allergies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Allergies ({allergies.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vitals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Vital Signs ({vitalSigns.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Medications</h3>
              <button
                onClick={() => setShowAddMedication(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Medication
              </button>
            </div>

            {showAddMedication && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">New Medication</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Medication name *"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 10mg)"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., Once daily)"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={newMedication.notes}
                    onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMedication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddMedication(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {medications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No medications recorded</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {medications.map((med) => (
                  <div key={med._id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {med.dosage && <span>{med.dosage}</span>}
                        {med.frequency && <span> • {med.frequency}</span>}
                      </div>
                      {med.notes && <p className="text-sm text-gray-500 mt-1">{med.notes}</p>}
                      <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                        Added: {new Date(med.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMedication(med._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Known Allergies</h3>
              <button
                onClick={() => setShowAddAllergy(true)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Allergy
              </button>
            </div>

            {showAddAllergy && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">New Allergy</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Allergen *"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Reaction"
                    value={newAllergy.reaction}
                    onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={newAllergy.severity}
                    onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={newAllergy.notes}
                    onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAllergy}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddAllergy(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {allergies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No allergies recorded</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {allergies.map((allergy) => (
                  <div key={allergy._id} className="flex items-start justify-between p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{allergy.allergen}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          allergy.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {allergy.severity}
                        </span>
                      </div>
                      {allergy.reaction && <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>}
                      {allergy.notes && <p className="text-sm text-gray-500 mt-1">{allergy.notes}</p>}
                      <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                        Added: {new Date(allergy.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAllergy(allergy._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs History</h3>
              <button
                onClick={() => setShowAddVitals(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Vitals
              </button>
            </div>

            {showAddVitals && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Record Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input
                    type="number"
                    placeholder="BP Systolic"
                    value={newVitals.bloodPressureSystolic}
                    onChange={(e) => setNewVitals({...newVitals, bloodPressureSystolic: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="BP Diastolic"
                    value={newVitals.bloodPressureDiastolic}
                    onChange={(e) => setNewVitals({...newVitals, bloodPressureDiastolic: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Heart Rate (bpm)"
                    value={newVitals.heartRate}
                    onChange={(e) => setNewVitals({...newVitals, heartRate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temperature (°F)"
                    value={newVitals.temperature}
                    onChange={(e) => setNewVitals({...newVitals, temperature: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={newVitals.weight}
                    onChange={(e) => setNewVitals({...newVitals, weight: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Height (cm)"
                    value={newVitals.height}
                    onChange={(e) => setNewVitals({...newVitals, height: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="SpO2 (%)"
                    value={newVitals.oxygenSaturation}
                    onChange={(e) => setNewVitals({...newVitals, oxygenSaturation: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Resp. Rate"
                    value={newVitals.respiratoryRate}
                    onChange={(e) => setNewVitals({...newVitals, respiratoryRate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddVitals}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddVitals(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {vitalSigns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No vital signs recorded</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {vitalSigns.slice().reverse().map((vital) => (
                  <div key={vital._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                        {new Date(vital.date).toLocaleDateString()} {new Date(vital.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                        <div>
                          <span className="text-gray-600">BP:</span>
                          <span className="ml-1 font-medium">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</span>
                        </div>
                      )}
                      {vital.heartRate && (
                        <div>
                          <span className="text-gray-600">HR:</span>
                          <span className="ml-1 font-medium">{vital.heartRate} bpm</span>
                        </div>
                      )}
                      {vital.temperature && (
                        <div>
                          <span className="text-gray-600">Temp:</span>
                          <span className="ml-1 font-medium">{vital.temperature}°F</span>
                        </div>
                      )}
                      {vital.weight && (
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-1 font-medium">{vital.weight} kg</span>
                        </div>
                      )}
                      {vital.oxygenSaturation && (
                        <div>
                          <span className="text-gray-600">SpO2:</span>
                          <span className="ml-1 font-medium">{vital.oxygenSaturation}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No timeline entries</p>
            ) : (
              <div className="space-y-4">
                {timeline.slice().reverse().map((entry) => (
                  <div key={entry._id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${
                        entry.type === 'medication' ? 'bg-green-100' :
                        entry.type === 'diagnosis' ? 'bg-blue-100' :
                        entry.type === 'procedure' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {entry.type === 'medication' && <Pill className="h-4 w-4 text-green-600" />}
                        {entry.type === 'diagnosis' && <Activity className="h-4 w-4 text-blue-600" />}
                        {entry.type === 'procedure' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(entry.date).toLocaleDateString()}</p>
                      <h4 className="font-semibold text-gray-900 mt-1">{entry.title}</h4>
                      {entry.description && <p className="text-sm text-gray-600 mt-1">{entry.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
