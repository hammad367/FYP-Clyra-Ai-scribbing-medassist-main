'use client';

import { X, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function TemplateDetailModal({ template, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{template.title}</h2>
              <p className="text-blue-100 text-sm">{template.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{template.description}</p>
          </div>

          {/* Metadata */}
          <div className="mb-6 flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              {template.category}
            </span>
            {template.supportsICD10 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                ICD-10 Supported
              </span>
            )}
          </div>

          {/* Prompt Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Template Prompt</h3>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {template.prompt}
              </pre>
            </div>
          </div>

          {/* Example Output (if available) */}
          {template.exampleOutput && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Example Output</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {template.exampleOutput}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
