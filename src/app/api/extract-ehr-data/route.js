import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { noteContent, transcription, dialogue } = await request.json();

    if (!noteContent && !transcription) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // Prepare content for AI extraction
    const contentToAnalyze = noteContent || transcription;

    // Call Groq AI to extract structured EHR data
    // Call Grok AI to extract structured EHR data
    const extractionPrompt = `You are a medical data extraction AI. Analyze the following medical note/transcription and extract structured EHR data.

Extract the following information if present:
1. Vital Signs (blood pressure, heart rate, temperature, weight, height, oxygen saturation, respiratory rate)
2. Medications (name, dosage, frequency)
3. Allergies (allergen, reaction, severity)
4. Diagnoses/Conditions
5. Procedures performed

Medical Content:
${contentToAnalyze}

Return ONLY a valid JSON object with this exact structure (use null for missing data):
{
  "vitalSigns": {
    "bloodPressureSystolic": number or null,
    "bloodPressureDiastolic": number or null,
    "heartRate": number or null,
    "temperature": number or null,
    "weight": number or null,
    "height": number or null,
    "oxygenSaturation": number or null,
    "respiratoryRate": number or null
  },
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage amount",
      "frequency": "frequency description",
      "active": true
    }
  ],
  "allergies": [
    {
      "allergen": "allergen name",
      "reaction": "reaction description",
      "severity": "mild|moderate|severe"
    }
  ],
  "diagnoses": [
    "diagnosis 1",
    "diagnosis 2"
  ],
  "procedures": [
    "procedure 1"
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical data extraction AI. Extract structured data from medical notes and return ONLY valid JSON.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const extractedText = completion.choices[0]?.message?.content || '{}';

    // Parse the JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', extractedText);
      return NextResponse.json({ 
        error: 'Failed to parse extracted data',
        extracted: null 
      }, { status: 500 });
    }

    // Clean up and validate the extracted data
    const cleanedData = {
      vitalSigns: null,
      medications: [],
      allergies: [],
      diagnoses: [],
      procedures: [],
      timeline: []
    };

    // Process vital signs
    if (extractedData.vitalSigns) {
      const vitals = extractedData.vitalSigns;
      const hasAnyVital = Object.values(vitals).some(v => v !== null && v !== undefined);
      
      if (hasAnyVital) {
        cleanedData.vitalSigns = {
          bloodPressureSystolic: vitals.bloodPressureSystolic || null,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic || null,
          heartRate: vitals.heartRate || null,
          temperature: vitals.temperature || null,
          weight: vitals.weight || null,
          height: vitals.height || null,
          oxygenSaturation: vitals.oxygenSaturation || null,
          respiratoryRate: vitals.respiratoryRate || null,
          date: new Date()
        };
      }
    }

    // Process medications
    if (extractedData.medications && Array.isArray(extractedData.medications)) {
      cleanedData.medications = extractedData.medications
        .filter(med => med.name)
        .map(med => ({
          name: med.name,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          active: med.active !== false,
          startDate: new Date()
        }));
    }

    // Process allergies
    if (extractedData.allergies && Array.isArray(extractedData.allergies)) {
      cleanedData.allergies = extractedData.allergies
        .filter(allergy => allergy.allergen)
        .map(allergy => ({
          allergen: allergy.allergen,
          reaction: allergy.reaction || '',
          severity: allergy.severity || 'moderate'
        }));
    }

    // Create timeline entries
    if (extractedData.diagnoses && extractedData.diagnoses.length > 0) {
      extractedData.diagnoses.forEach(diagnosis => {
        cleanedData.timeline.push({
          type: 'diagnosis',
          title: `Diagnosed: ${diagnosis}`,
          description: diagnosis,
          date: new Date()
        });
      });
    }

    if (extractedData.procedures && extractedData.procedures.length > 0) {
      extractedData.procedures.forEach(procedure => {
        cleanedData.timeline.push({
          type: 'procedure',
          title: `Procedure: ${procedure}`,
          description: procedure,
          date: new Date()
        });
      });
    }

    if (cleanedData.medications.length > 0) {
      cleanedData.medications.forEach(med => {
        cleanedData.timeline.push({
          type: 'medication',
          title: `Started: ${med.name}`,
          description: `${med.name} ${med.dosage} ${med.frequency}`,
          date: new Date()
        });
      });
    }

    // Return extracted data
    return NextResponse.json({
      success: true,
      extracted: cleanedData,
      hasData: cleanedData.vitalSigns !== null || 
               cleanedData.medications.length > 0 || 
               cleanedData.allergies.length > 0 ||
               cleanedData.timeline.length > 0
    });

  } catch (error) {
    console.error('EHR extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract EHR data', details: error.message },
      { status: 500 }
    );
  }
}
