'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mic, Upload, FileText, Users, Stethoscope, Shield } from 'lucide-react';

export default function HelpFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      icon: HelpCircle,
      questions: [
        {
          q: "What is Clyra MedAssist?",
          a: "Clyra MedAssist is an AI-powered medical documentation platform that helps healthcare providers transcribe clinical conversations, generate structured medical notes (SOAP, ADIME, etc.), and predict potential diagnoses using advanced AI technology."
        },
        {
          q: "How do I create my first session?",
          a: "1. Click 'New session' in the sidebar\n2. Select a patient or add a new one\n3. Choose to either upload an audio file or record live\n4. Select a note template (SOAP, ADIME, etc.)\n5. The AI will transcribe and generate your clinical note automatically"
        },
        {
          q: "What note templates are available?",
          a: "We offer multiple templates including SOAP Notes, ADIME Notes, Psychiatric Evaluation, Pediatric Assessment, Geriatric Assessment, Dietetics Notes, and more. Each template is optimized for specific medical specialties."
        }
      ]
    },
    {
      category: "Recording & Transcription",
      icon: Mic,
      questions: [
        {
          q: "How do I record a session?",
          a: "Click 'New session', select your patient, then choose 'Dictate' to record live. Click the microphone button to start recording. The system will automatically transcribe your conversation in real-time."
        },
        {
          q: "Can I upload pre-recorded audio?",
          a: "Yes! Click 'Upload' instead of 'Dictate' and select your audio file. Supported formats include MP3, WAV, M4A, and other common audio formats. The AI will process and transcribe it automatically."
        },
        {
          q: "How accurate is the transcription?",
          a: "Our AI achieves 95%+ accuracy for clear audio. For best results, ensure good audio quality, minimal background noise, and clear speech. You can always edit the transcription and generated notes."
        },
        {
          q: "What languages are supported?",
          a: "Currently, the system is optimized for English medical conversations. Additional language support is planned for future updates."
        }
      ]
    },
    {
      category: "Patient Management",
      icon: Users,
      questions: [
        {
          q: "How do I add a new patient?",
          a: "Click 'Patients' in the sidebar, then click 'Add Patient'. Fill in the patient's basic information (name, age, sex, DOB). The system will automatically generate a unique Medical Record Number (MRN)."
        },
        {
          q: "What is an MRN?",
          a: "MRN (Medical Record Number) is a unique identifier for each patient. Our system auto-generates MRNs in the format CLY-YYYYMMDD-XXXX (e.g., CLY-20260414-0001) to ensure uniqueness and traceability."
        },
        {
          q: "How do I search for a patient?",
          a: "Go to the 'Patients' tab and use the search bar. You can search by patient name or MRN. Click 'View Details' to see their complete medical history or 'New Session' to start a new consultation."
        },
        {
          q: "Can patients access their records?",
          a: "Yes! Patients can create an account using their MRN and email. They'll have secure access to view their medical records and session summaries through the Patient Portal."
        }
      ]
    },
    {
      category: "Clinical Notes & Editing",
      icon: FileText,
      questions: [
        {
          q: "How do I edit a generated note?",
          a: "Open any session from 'View sessions', click the 'Edit' button (pencil icon) in the top right. Make your changes, then click 'Save' to update the record. Changes are saved to the database immediately."
        },
        {
          q: "Can I add ICD-10 codes?",
          a: "Yes! When viewing or editing a note, you can add ICD-10 diagnostic codes. The system also provides AI-powered suggestions based on the clinical content."
        },
        {
          q: "How do I download a note?",
          a: "Click the 'Download' button when viewing any note. The system will generate a text file containing the complete medical note, patient information, and ICD-10 codes."
        },
        {
          q: "Are my edits saved automatically?",
          a: "No, you must click the 'Save' button to persist your changes. This prevents accidental modifications. After saving, the session history will update automatically."
        }
      ]
    },
    {
      category: "AI Features",
      icon: Stethoscope,
      questions: [
        {
          q: "What is AI Disease Prediction?",
          a: "Our fine-tuned Gemma AI model analyzes clinical notes and suggests potential diagnoses based on symptoms, examination findings, and patient history. This is a supportive tool - always verify with your clinical judgment."
        },
        {
          q: "How does dialogue separation work?",
          a: "The AI automatically identifies and separates doctor and patient speech from the transcription, making it easier to review the conversation flow and extract relevant clinical information."
        },
        {
          q: "Can I customize note templates?",
          a: "Currently, you can choose from our pre-built templates. Custom template creation is planned for future updates. Contact support if you need a specific template for your specialty."
        }
      ]
    },
    {
      category: "Patient Portal",
      icon: Shield,
      questions: [
        {
          q: "How do patients sign up?",
          a: "Patients need their MRN (provided by their doctor) and name to create an account. They'll set their own email and password for secure access to their medical records."
        },
        {
          q: "What can patients see in their portal?",
          a: "Patients can view their medical records, session summaries, and ICD-10 diagnostic codes. For privacy, raw transcriptions and audio files are not accessible to patients."
        },
        {
          q: "Is the patient portal secure?",
          a: "Yes! We use bank-level encryption, HIPAA-compliant data handling, and secure JWT authentication. All data is encrypted in transit and at rest."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: HelpCircle,
      questions: [
        {
          q: "My sessions aren't showing in View Sessions",
          a: "Try refreshing the page. If the issue persists, ensure you've selected the correct patient and that the session was saved successfully. Check the browser console for any error messages."
        },
        {
          q: "Audio upload is failing",
          a: "Ensure your audio file is in a supported format (MP3, WAV, M4A) and under 100MB. Check your internet connection and try again. Large files may take a few minutes to process."
        },
        {
          q: "I can't edit my notes",
          a: "Click the 'Edit' button (pencil icon) to enter edit mode. Make your changes, then click 'Save'. If the button is disabled, ensure you have the necessary permissions."
        },
        {
          q: "Where can I get more help?",
          a: "Contact our support team at support@clyra.com or check our documentation at docs.clyra.com for detailed guides and tutorials."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Help & FAQ</h1>
        <p className="text-gray-600">
          Find answers to common questions about using Clyra MedAssist
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div key={categoryIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {category.questions.map((faq, questionIndex) => {
                  const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                      >
                        <span className="font-semibold text-gray-900">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Still need help?</h3>
        <p className="text-blue-800 mb-4">
          Our support team is here to assist you with any questions or issues.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:support@clyra.com"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Email Support
          </a>
          <a
            href="https://docs.clyra.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
