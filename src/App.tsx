/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Search, AlertCircle, CheckCircle2, Loader2, Info, ArrowRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GEMINI_MODEL = "gemini-3-flash-preview";

interface AnalysisResult {
  bias: 'Yes' | 'No';
  explanation: string;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    "Men are naturally better leaders than women.",
    "All employees must attend the meeting at 10 AM.",
    "The nurse did her best to help the patient.",
    "We need a strong man to handle this heavy machinery.",
    "The doctor entered the room with his assistant."
  ];

  const analyzeText = async (textToAnalyze: string = inputText) => {
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `You are a linguistic assistant that detects gender bias in text.

Analyze the given sentence or paragraph and check if it contains *gender bias or stereotypes*.  

Output format:
Bias: [Yes / No]  
Explanation: A short 1–2 sentence explanation about why this text is biased or not.

User text: ${textToAnalyze}`,
      });

      const output = response.text || '';
      parseResult(output);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the text. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseResult = (text: string) => {
    const biasMatch = text.match(/Bias:\s*(Yes|No)/i);
    const explanationMatch = text.match(/Explanation:\s*(.*)/i);

    if (biasMatch) {
      setResult({
        bias: biasMatch[1].toLowerCase() === 'yes' ? 'Yes' : 'No',
        explanation: explanationMatch ? explanationMatch[1].trim() : "No explanation provided."
      });
    } else {
      setError("The AI returned an unexpected format. Please try again.");
    }
  };

  const handleExampleClick = (example: string) => {
    setInputText(example);
    analyzeText(example);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-full mb-4"
          >
            <Search className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-2">Sociolinguistic Tool</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4"
          >
            Gender Bias Detector
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-xl mx-auto"
          >
            Identify subtle gender stereotypes and biased language in your writing to foster more inclusive communication.
          </motion.p>
        </header>

        {/* Main Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4 text-slate-400">
              <Quote className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Input Text</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a sentence or paragraph here..."
              className="w-full h-32 md:h-40 p-0 text-lg bg-transparent border-none focus:ring-0 resize-none placeholder:text-slate-300"
            />
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-100 gap-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-full md:w-auto mb-1 md:mb-0">Try an example:</span>
                {examples.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(ex)}
                    className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                  >
                    {ex.length > 25 ? ex.substring(0, 25) + '...' : ex}
                  </button>
                ))}
              </div>
              <button
                onClick={() => analyzeText()}
                disabled={isLoading || !inputText.trim()}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${
                  isLoading || !inputText.trim() 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Detect Bias
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 mb-8"
            >
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl border p-6 md:p-8 ${
                result.bias === 'Yes' 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${
                  result.bias === 'Yes' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {result.bias === 'Yes' ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      result.bias === 'Yes' ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      Analysis Result
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    result.bias === 'Yes' ? 'text-amber-900' : 'text-emerald-900'
                  }`}>
                    {result.bias === 'Yes' ? 'Gender Bias Detected' : 'No Gender Bias Detected'}
                  </h3>
                  <p className={`text-lg leading-relaxed ${
                    result.bias === 'Yes' ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {result.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-200"
        >
          <div className="flex items-start gap-4 text-slate-500">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-slate-700 mb-1">Why detect gender bias?</p>
              <p>
                Language shapes our perception of the world. Gender bias in language often reinforces stereotypes, 
                limits opportunities, and creates exclusionary environments. This tool helps identify both overt 
                and subtle biases to promote more equitable communication.
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
