'use client';

import React from 'react';
import { 
  Target, Heart, Activity, AlertTriangle, Pill, Brain, Baby, Sparkles,
  Plus, Trash2, CheckCircle2, Loader2, Info
} from 'lucide-react';

interface Complaint {
  description: string;
  painLevel: number;
}

interface AnamnesisData {
  complaints: Complaint[];
  treatmentGoal: string;
  resources: string;
  diseases: string[];
  otherDiseases: string;
  accidents: string;
  otherIllnesses: string;
  eventfulEvents: string;
  surgeries: string;
  longtermCortison: boolean;
  longtermRheuma: boolean;
  otherLongtermMeds: string;
  currentMeds: string;
  emotionalHospitalization: string;
  emotionalMeds: string;
  birthKomplications: string;
  pregnant: string;
  miscarriages: string;
  cranioExperience: string;
}

const PREDEFINED_DISEASES = [
  'Wirbelsäulenerkrankungen',
  'Schleudertrauma',
  'Rheumatische Krankheiten',
  'Gehirnerschütterung',
  'Schädel-/Hirntrauma',
  'Blutungen im Schädel',
  'Meningitis',
  'Depression',
  'Psychosen',
  'Schlaflosigkeit',
  'Migräne',
  'Epilepsie',
  'Bluthochdruck',
  'Aneurysmen',
  'Art. Durchblutungsstörungen',
  'Ven. Durchblutungsstörungen',
  'Schlaganfall',
  'Glaukom',
  'Diabetes mellitus',
  'Krebserkrankungen'
];

const defaultAnamnesis = (): AnamnesisData => ({
  complaints: [{ description: '', painLevel: 5 }],
  treatmentGoal: '',
  resources: '',
  diseases: [],
  otherDiseases: '',
  accidents: '',
  otherIllnesses: '',
  eventfulEvents: '',
  surgeries: '',
  longtermCortison: false,
  longtermRheuma: false,
  otherLongtermMeds: '',
  currentMeds: '',
  emotionalHospitalization: '',
  emotionalMeds: '',
  birthKomplications: '',
  pregnant: '',
  miscarriages: '',
  cranioExperience: ''
});

interface CranioAnamnesisTabProps {
  clientId: string;
}

export default function CranioAnamnesisTab({ clientId }: CranioAnamnesisTabProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [state, setState] = React.useState<{ clientId: string; data: AnamnesisData }>({
    clientId: '',
    data: defaultAnamnesis()
  });

  // Load data when clientId changes
  React.useEffect(() => {
    if (!clientId) return;
    const stored = localStorage.getItem('praxis_manager_cranio_anamnesis');
    let loadedData = defaultAnamnesis();
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed[clientId]) {
          // Merge with defaultAnamnesis to handle potential missing fields
          loadedData = { ...defaultAnamnesis(), ...parsed[clientId] };
        }
      } catch (e) {
        console.error('Error loading anamnesis data:', e);
      }
    }
    
    setState({ clientId, data: loadedData });
  }, [clientId]);

  // Debounced auto-save effect
  React.useEffect(() => {
    if (!clientId || state.clientId !== clientId) return;

    const delayDebounceFn = setTimeout(() => {
      setIsSaving(true);
      try {
        const stored = localStorage.getItem('praxis_manager_cranio_anamnesis');
        let parsed = stored ? JSON.parse(stored) : {};
        parsed[clientId] = state.data;
        localStorage.setItem('praxis_manager_cranio_anamnesis', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error saving anamnesis data:', e);
      }
      
      // Simulate brief saving spinner for user feedback
      setTimeout(() => setIsSaving(false), 500);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [state.data, clientId]);

  // Helper to update fields
  const updateField = (key: keyof AnamnesisData, value: any) => {
    setState(prev => {
      if (prev.clientId !== clientId) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [key]: value
        }
      };
    });
  };

  const data = state.clientId === clientId ? state.data : defaultAnamnesis();

  // Complaints Handlers
  const handleAddComplaint = () => {
    const updated = [...data.complaints, { description: '', painLevel: 5 }];
    updateField('complaints', updated);
  };

  const handleRemoveComplaint = (index: number) => {
    if (data.complaints.length <= 1) return;
    const updated = data.complaints.filter((_, idx) => idx !== index);
    updateField('complaints', updated);
  };

  const handleComplaintChange = (index: number, field: keyof Complaint, val: any) => {
    const updated = data.complaints.map((c, idx) => {
      if (idx === index) {
        return { ...c, [field]: val };
      }
      return c;
    });
    updateField('complaints', updated);
  };

  // Disease Tag Handler
  const handleToggleDisease = (disease: string) => {
    const updated = data.diseases.includes(disease)
      ? data.diseases.filter(d => d !== disease)
      : [...data.diseases, disease];
    updateField('diseases', updated);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title & Saving Status Bar */}
      <div className="flex justify-between items-center pb-2 border-b border-[#bfc9c3]/20 flex-shrink-0">
        <div>
          <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Cranio-Anamnesebogen</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Spezifische Fragen vor der craniosacralen Behandlung.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 bg-white border border-[#bfc9c3]/30 px-3 py-1.5 rounded-xl shadow-sm transition-all duration-300">
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#003527] animate-spin" />
              <span className="text-[#003527]">Speichere...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-zinc-500">Alle Änderungen gespeichert</span>
            </>
          )}
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* BOX 1: Aktuelle Beschwerden & Behandlungsziel (Col span 2) */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden md:col-span-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Aktuelle Beschwerden</h4>
            </div>
            <button
              type="button"
              onClick={handleAddComplaint}
              className="text-[10px] font-bold text-[#003527] hover:text-[#0b513d] bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-md px-3 py-1.5 transition-colors cursor-pointer active:scale-95"
            >
              + Beschwerde
            </button>
          </div>

          <div className="space-y-3.5">
            {data.complaints.map((complaint, index) => (
              <div 
                key={index} 
                className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/40 relative group/item hover:border-zinc-300/60 transition-all"
              >
                {data.complaints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveComplaint(index)}
                    className="absolute top-3.5 right-3.5 w-6 h-6 rounded-md bg-white border border-zinc-200/50 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-sm opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer"
                    title="Beschwerde entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <input
                  type="text"
                  value={complaint.description}
                  onChange={(e) => handleComplaintChange(index, 'description', e.target.value)}
                  placeholder="z.B. Spannungskopfschmerzen / Nackensteifigkeit..."
                  className="w-full bg-transparent border-none px-0 py-1 text-xs font-extrabold text-[#003527] focus:ring-0 placeholder-zinc-400 outline-none mb-3"
                />

                <div className="flex items-center gap-4 bg-white border border-zinc-200/40 p-2.5 rounded-lg">
                  <span className="text-[10px] font-bold text-zinc-400 w-24">Schmerz (0-10):</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={complaint.painLevel}
                    onChange={(e) => handleComplaintChange(index, 'painLevel', parseInt(e.target.value))}
                    className="flex-grow accent-[#003527] h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-rose-600 w-6 text-right select-none">
                    {complaint.painLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-100 space-y-1 text-left">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Behandlungsziel / Positiver Wunsch</label>
            <textarea
              rows={2}
              value={data.treatmentGoal}
              onChange={(e) => updateField('treatmentGoal', e.target.value)}
              placeholder="z.B. 'Ich möchte meinen Nacken wieder frei bewegen können' anstatt 'Ich will keine Schmerzen mehr'"
              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
            />
          </div>
        </div>

        {/* BOX 2: Ressourcen */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/40 text-rose-700">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Ressourcen</h4>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Was hilft Ihnen, sich wohlzufühlen?</label>
              <p className="text-[10px] text-zinc-400 italic">Natur, Hobbies, Familie, Tiere, spirituelle Praxis...</p>
              <textarea
                rows={5}
                value={data.resources}
                onChange={(e) => updateField('resources', e.target.value)}
                placeholder="z.B. Meine Kraftquellen sind Spaziergänge im Wald, Musikhören..."
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[120px]"
              />
            </div>
          </div>
        </div>

        {/* BOX 3: Spezifische Vorerkrankungen (Full Width - Col Span 3) */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden xl:col-span-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/40 text-indigo-700">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Spezifische Vorerkrankungen</h4>
          </div>
          
          <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
            Sind Sie oder waren Sie je an einer der folgenden Krankheiten erkrankt? (Zum Aktivieren anklicken)
          </p>

          <div className="flex flex-wrap gap-2 py-1">
            {PREDEFINED_DISEASES.map((disease) => {
              const isActive = data.diseases.includes(disease);
              return (
                <button
                  key={disease}
                  type="button"
                  onClick={() => handleToggleDisease(disease)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#003527] border-[#003527] text-white shadow-sm'
                      : 'bg-zinc-100/50 border-zinc-200/60 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {disease}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <input
              type="text"
              value={data.otherDiseases}
              onChange={(e) => updateField('otherDiseases', e.target.value)}
              placeholder="Andere Erkrankungen (Bitte hier eintragen)..."
              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all"
            />
          </div>
        </div>

        {/* BOX 4: Unfälle & Einschneidende Ereignisse (Col span 2) */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200/40 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Unfälle & Einschneidende Ereignisse</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unfälle im Leben?</label>
              <textarea
                rows={2}
                value={data.accidents}
                onChange={(e) => updateField('accidents', e.target.value)}
                placeholder="Wenn ja, wann und mit welchen Folgen?"
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Andere schwere Krankheiten?</label>
              <textarea
                rows={2}
                value={data.otherIllnesses}
                onChange={(e) => updateField('otherIllnesses', e.target.value)}
                placeholder="Welche und wann?"
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Einschneidende Ereignisse?</label>
            <textarea
              rows={2}
              value={data.eventfulEvents}
              onChange={(e) => updateField('eventfulEvents', e.target.value)}
              placeholder="Verluste, Umbrüche, starke Veränderungen..."
              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
            />
          </div>
        </div>

        {/* BOX 5: OPs & Medikation */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                <Pill className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">OPs & Medikation</h4>
            </div>

            <div className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OPs mit Vollnarkose?</label>
                <input
                  type="text"
                  value={data.surgeries}
                  onChange={(e) => updateField('surgeries', e.target.value)}
                  placeholder="z.B. Blinddarm-OP (2018)"
                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <label className="block text-[10px] font-bold text-[#003527]/75 uppercase tracking-widest mb-1.5">Langzeit-Medikation (mind. 5 Jahre)</label>
                <div className="flex gap-4 mb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.longtermCortison}
                      onChange={(e) => updateField('longtermCortison', e.target.checked)}
                      className="w-4 h-4 text-[#003527] focus:ring-[#003527] border-zinc-300 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#003527]">Cortison</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.longtermRheuma}
                      onChange={(e) => updateField('longtermRheuma', e.target.checked)}
                      className="w-4 h-4 text-[#003527] focus:ring-[#003527] border-zinc-300 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#003527]">Rheumamittel</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={data.otherLongtermMeds}
                  onChange={(e) => updateField('otherLongtermMeds', e.target.value)}
                  placeholder="Andere Langzeit-Medikamente..."
                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Derzeitige Medikamente?</label>
                <input
                  type="text"
                  value={data.currentMeds}
                  onChange={(e) => updateField('currentMeds', e.target.value)}
                  placeholder="Welche Medikamente werden aktuell eingenommen?"
                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOX 6: Emotionale Historie */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
              <Brain className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Emotionale Historie</h4>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stationäre Behandlung?</label>
              <textarea
                rows={2}
                value={data.emotionalHospitalization}
                onChange={(e) => updateField('emotionalHospitalization', e.target.value)}
                placeholder="Stationäre Behandlung wegen emotionaler Probleme? Falls ja, wann?"
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
              />
            </div>
            
            <div className="space-y-1 pt-1 border-t border-zinc-100">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Medikamente (emotional)?</label>
              <textarea
                rows={2}
                value={data.emotionalMeds}
                onChange={(e) => updateField('emotionalMeds', e.target.value)}
                placeholder="Medikamente wegen emotionaler Probleme? Falls ja, welche und wann?"
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
              />
            </div>
          </div>
        </div>

        {/* BOX 7: Geburt & Schwangerschaft */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 border border-pink-200/40 text-pink-700">
              <Baby className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Geburt & Schwangerschaft</h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Komplikationen bei eigener Geburt?</label>
              <textarea
                rows={2}
                value={data.birthKomplications}
                onChange={(e) => updateField('birthKomplications', e.target.value)}
                placeholder="Soweit bekannt (z.B. Saugglocke, Zangengeburt, Kaiserschnitt)..."
                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Schwanger?</label>
                <select
                  value={data.pregnant}
                  onChange={(e) => updateField('pregnant', e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/50 rounded-xl px-3 py-2 font-bold text-xs text-[#003527] cursor-pointer focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                >
                  <option value="">-</option>
                  <option value="Nein">Nein</option>
                  <option value="Ja">Ja</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fehlgeburten?</label>
                <input
                  type="text"
                  value={data.miscarriages}
                  onChange={(e) => updateField('miscarriages', e.target.value)}
                  placeholder="Wann / wie oft?"
                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOX 8: Cranio Erfahrung */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm hover:border-[#bfc9c3]/60 transition-all duration-300 relative group overflow-hidden bg-gradient-to-br from-white to-emerald-50/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200/40 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#003527] uppercase tracking-wider">Cranio-Erfahrung</h4>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">Bisherige Craniosacrale Behandlungen?</label>
            <textarea
              rows={3}
              value={data.cranioExperience}
              onChange={(e) => updateField('cranioExperience', e.target.value)}
              placeholder="Falls ja, wann und wie oft? Wie haben Sie diese empfunden?"
              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[90px]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
