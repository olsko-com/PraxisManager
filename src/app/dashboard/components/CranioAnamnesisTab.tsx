'use client';

import React from 'react';
import { 
  Target, Heart, Activity, AlertTriangle, Pill, Brain, Baby, Sparkles,
  Plus, Trash2, CheckCircle2, Loader2, Pencil
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
  surgeries: string[];
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
  surgeries: [''],
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

const isAnamnesisEmpty = (data: AnamnesisData): boolean => {
  const isComplaintsEmpty = data.complaints.length === 0 || 
    (data.complaints.length === 1 && !data.complaints[0].description.trim());
  const isSurgeriesEmpty = data.surgeries.length === 0 || 
    (data.surgeries.length === 1 && !data.surgeries[0].trim());
    
  return (
    isComplaintsEmpty &&
    !data.treatmentGoal.trim() &&
    !data.resources.trim() &&
    data.diseases.length === 0 &&
    !data.otherDiseases.trim() &&
    !data.accidents.trim() &&
    !data.otherIllnesses.trim() &&
    !data.eventfulEvents.trim() &&
    isSurgeriesEmpty &&
    !data.longtermCortison &&
    !data.longtermRheuma &&
    !data.otherLongtermMeds.trim() &&
    !data.currentMeds.trim() &&
    !data.emotionalHospitalization.trim() &&
    !data.emotionalMeds.trim() &&
    !data.birthKomplications.trim() &&
    !data.pregnant &&
    !data.miscarriages.trim() &&
    !data.cranioExperience.trim()
  );
};

interface CranioAnamnesisTabProps {
  clientId: string;
  isEditing?: boolean;
  setIsEditing?: (val: boolean) => void;
}

export default function CranioAnamnesisTab({ clientId, isEditing: propIsEditing, setIsEditing: propSetIsEditing }: CranioAnamnesisTabProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDiseasesExpanded, setIsDiseasesExpanded] = React.useState(false);
  
  const [localIsEditing, setLocalIsEditing] = React.useState(false);
  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing !== undefined ? propSetIsEditing : setLocalIsEditing;
  const [state, setState] = React.useState<{ clientId: string; data: AnamnesisData }>({
    clientId: '',
    data: defaultAnamnesis()
  });

  // Load data when clientId changes or when custom event fires
  React.useEffect(() => {
    if (!clientId) return;
    
    const loadData = () => {
      const stored = localStorage.getItem('praxis_manager_cranio_anamnesis');
      let loadedData = defaultAnamnesis();
      let shouldEdit = false;
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed[clientId]) {
            const raw = parsed[clientId];
            // Backwards compatibility: convert legacy string surgeries to array of string
            if (typeof raw.surgeries === 'string') {
              raw.surgeries = raw.surgeries.trim() ? [raw.surgeries] : [''];
            }
            loadedData = { ...defaultAnamnesis(), ...raw };
          } else {
            shouldEdit = true;
          }
        } catch (e) {
          console.error('Error loading anamnesis data:', e);
          shouldEdit = true;
        }
      } else {
        shouldEdit = true;
      }
      
      if (isAnamnesisEmpty(loadedData)) {
        shouldEdit = true;
      }
      
      setState({ clientId, data: loadedData });
      setIsEditing(shouldEdit);
    };

    loadData();

    if (typeof window !== 'undefined') {
      window.addEventListener('anamnesis_updated', loadData);
      return () => {
        window.removeEventListener('anamnesis_updated', loadData);
      };
    }
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

  // Surgeries Handlers
  const handleAddSurgery = () => {
    const updated = [...data.surgeries, ''];
    updateField('surgeries', updated);
  };

  const handleRemoveSurgery = (index: number) => {
    if (data.surgeries.length <= 1) return;
    const updated = data.surgeries.filter((_, idx) => idx !== index);
    updateField('surgeries', updated);
  };

  const handleSurgeryChange = (index: number, val: string) => {
    const updated = data.surgeries.map((s, idx) => idx === index ? val : s);
    updateField('surgeries', updated);
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
      <div className="flex justify-end items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {isEditing && isSaving && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 bg-white border border-[#bfc9c3]/30 px-3 py-1.5 rounded-xl shadow-sm transition-all duration-300">
              <Loader2 className="w-3.5 h-3.5 text-[#003527] animate-spin" />
              <span className="text-[#003527]">Speichere...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      {!isEditing && isAnamnesisEmpty(data) ? (
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-10 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-[#003527]">Keine Anamnese vorhanden</h5>
            <p className="text-xs text-zinc-400">Für diesen Klienten wurde noch kein Anamnesebogen ausgefüllt.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#003527] hover:bg-[#0b513d] text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Anamnesebogen anlegen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in pb-12">
              
              {/* BOX 1: Aktuelle Beschwerden & Behandlungsziel (Col span 2) */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-2 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Aktuelle Beschwerden</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Symptome, Schmerzintensität und Therapiewunsch</p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddComplaint}
                        className="text-[9px] font-bold text-[#003527] hover:text-[#0b513d] bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        + Beschwerde
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      {data.complaints.map((complaint, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-[#f9f9f8] rounded-xl border border-zinc-200/40 relative group/item hover:border-zinc-300/60 transition-all text-left"
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
                      
                      <div className="pt-3 border-t border-zinc-100 space-y-1 text-left">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Behandlungswunsch</label>
                        <textarea
                          rows={2}
                          value={data.treatmentGoal}
                          onChange={(e) => updateField('treatmentGoal', e.target.value)}
                          placeholder="z.B. 'Ich möchte meinen Nacken wieder frei bewegen können' anstatt 'Ich will keine Schmerzen mehr'"
                          className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {data.complaints.filter(c => c.description.trim() !== '').length === 0 ? (
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-medium text-zinc-400">Aktuelle Beschwerden</span>
                          <span className="block text-xs font-extrabold text-zinc-400 italic">Keine aktuellen Beschwerden angegeben.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                          {data.complaints
                            .filter(c => c.description.trim() !== '')
                            .map((complaint, index) => (
                              <div key={index} className="space-y-1 p-3 bg-zinc-50 border border-zinc-200/20 rounded-xl text-left">
                                <span className="block text-[10px] font-medium text-zinc-400">Beschwerde {index + 1}</span>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="block text-xs font-extrabold text-[#003527] truncate">{complaint.description}</span>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                    complaint.painLevel >= 8 
                                      ? 'bg-rose-50 border-rose-200/50 text-rose-800' 
                                      : complaint.painLevel >= 4 
                                        ? 'bg-amber-50 border-amber-200/50 text-amber-800' 
                                        : 'bg-emerald-50 border-emerald-200/50 text-emerald-800'
                                  }`}>
                                    Intensität: {complaint.painLevel}/10
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      <div className="pl-3 border-l-2 border-emerald-500/30 space-y-1 pt-1 mt-1 text-left">
                        <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Behandlungswunsch</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.treatmentGoal.trim() ? data.treatmentGoal : 'Keine Angabe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOX 2: Ressourcen */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-1 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/40 text-rose-700">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Ressourcen</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Kraftquellen & Wohlbefinden</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-1 text-left">
                      <p className="text-[10px] text-zinc-400 italic">Was hilft Ihnen, sich wohlzufühlen? (z.B. Natur, Hobbies, Familie...)</p>
                      <textarea
                        rows={5}
                        value={data.resources}
                        onChange={(e) => updateField('resources', e.target.value)}
                        placeholder="z.B. Meine Kraftquellen sind Spaziergänge im Wald, Musik..."
                        className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[120px]"
                      />
                    </div>
                  ) : (
                    <div className="pl-3 border-l-2 border-rose-500/30 space-y-1 text-left pt-1">
                      <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Was hilft Ihnen, sich wohlzufühlen?</span>
                      <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                        {data.resources.trim() ? data.resources : 'Keine Angabe'}
                      </span>
                    </div>
                  )}
                </div>
              </div>




              
              {/* BOX 3: Spezifische Vorerkrankungen (Col span 3) */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-3 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/40 text-indigo-700">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Spezifische Vorerkrankungen</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Vorerkrankungen, Unfälle & sonstige Beeinträchtigungen</p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsDiseasesExpanded(!isDiseasesExpanded)}
                        className="text-[9px] font-bold text-[#003527] hover:text-[#0b513d] bg-zinc-100 hover:bg-[#003527]/5 border border-[#bfc9c3]/20 rounded-md px-2.5 py-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        {isDiseasesExpanded ? 'Auswahl zuklappen' : 'Vorerkrankungen auswählen'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2.5 bg-zinc-50 rounded-xl px-4 border border-zinc-200/30">
                        <span className="text-[10px] text-[#003527] font-extrabold">
                          {data.diseases.length === 0 
                            ? 'Keine spezifischen Vorerkrankungen ausgewählt' 
                            : `${data.diseases.length} Vorerkrankung(en) ausgewählt`}
                        </span>
                        {data.diseases.length > 0 && !isDiseasesExpanded && (
                          <span className="text-[10px] text-zinc-400 font-semibold truncate max-w-[280px] sm:max-w-[480px]">
                            ({data.diseases.join(', ')})
                          </span>
                        )}
                      </div>

                      {isDiseasesExpanded && (
                        <div className="space-y-3 pt-1 animate-fade-in">
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            Bitte zutreffende Vorerkrankungen anklicken:
                          </p>

                          <div className="flex flex-wrap gap-2 py-1 text-left">
                            {PREDEFINED_DISEASES.map((disease) => {
                              const isActive = data.diseases.includes(disease);
                              return (
                                <button
                                  key={disease}
                                  type="button"
                                  onClick={() => handleToggleDisease(disease)}
                                  className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
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
                        </div>
                      )}

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
                  ) : (
                    <div className="space-y-4 pt-1 text-left">
                      <div className="space-y-2">
                        <span className="block text-[10px] font-medium text-zinc-400">Ausgewählte Vorerkrankungen</span>
                        {data.diseases.length === 0 ? (
                          <span className="block text-xs font-extrabold text-zinc-400 italic">Keine spezifischen Vorerkrankungen ausgewählt</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {data.diseases.map(disease => (
                              <span key={disease} className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 border border-indigo-200/50 text-indigo-800">
                                {disease}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="pl-3 border-l-2 border-indigo-500/30 space-y-1 pt-1 mt-1 text-left">
                        <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Andere/Sonstige Vorerkrankungen</span>
                        <span className="block text-xs font-extrabold text-[#003527]">
                          {data.otherDiseases.trim() ? data.otherDiseases : 'Keine Angabe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOX 4: Unfälle & OPs (Col span 2) */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-2 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Unfälle, OPs & Ereignisse</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Verletzungen, traumatische Ereignisse & Narkosen</p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddSurgery}
                        className="text-[9px] font-bold text-[#003527] hover:text-[#0b513d] bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        + OP hinzufügen
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 text-left">
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

                      <div className="space-y-1 pt-1 border-t border-zinc-100">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Einschneidende Ereignisse?</label>
                        <textarea
                          rows={2}
                          value={data.eventfulEvents}
                          onChange={(e) => updateField('eventfulEvents', e.target.value)}
                          placeholder="Verluste, Umbrüche, starke Veränderungen..."
                          className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-zinc-100 text-left">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OPs mit Vollnarkose? (Welche und wann?)</label>
                        <div className="space-y-2">
                          {data.surgeries.map((surgery, index) => (
                            <div key={index} className="flex items-center gap-2 group/op relative animate-fade-in">
                              <input
                                type="text"
                                value={surgery}
                                onChange={(e) => handleSurgeryChange(index, e.target.value)}
                                placeholder="z.B. Blinddarm-OP (2018)"
                                className="flex-grow bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all pr-8"
                              />
                              {data.surgeries.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSurgery(index)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-rose-500 rounded transition-colors cursor-pointer bg-transparent border-none"
                                  title="OP entfernen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pt-1 text-left">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Unfälle im Leben?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.accidents.trim() ? data.accidents : 'Keine Angabe'}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Andere schwere Krankheiten?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.otherIllnesses.trim() ? data.otherIllnesses : 'Keine Angabe'}
                        </span>
                      </div>

                      <div className="space-y-0.5 sm:col-span-2 border-t border-zinc-100 pt-2.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Einschneidende Ereignisse?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.eventfulEvents.trim() ? data.eventfulEvents : 'Keine Angabe'}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2 border-t border-zinc-100 pt-2.5 text-left">
                        <span className="block text-[10px] font-medium text-zinc-400">OPs mit Vollnarkose?</span>
                        {data.surgeries.filter(s => s.trim() !== '').length === 0 ? (
                          <span className="block text-xs font-extrabold text-zinc-400 italic">Keine Angabe</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {data.surgeries.filter(s => s.trim() !== '').map((op, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-50 border border-amber-200/50 text-amber-800">
                                {op}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOX 5: Medikation (Col span 1) */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-1 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Medikation</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Langzeit- & aktuelle Medikation</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Langzeit-Medikation (mind. 5 Jahre)</label>
                        <div className="flex flex-col gap-2.5 pl-1">
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
                          className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2 font-semibold text-xs text-[#003527] outline-none transition-all mt-2"
                        />
                      </div>

                      <div className="space-y-1 pt-2 border-t border-zinc-100">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Derzeitige Medikamente?</label>
                        <input
                          type="text"
                          value={data.currentMeds}
                          onChange={(e) => updateField('currentMeds', e.target.value)}
                          placeholder="Aktuelle Medikamente..."
                          className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-y-3.5 pt-1 text-left">
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Langzeit-Medikation</span>
                        <div className="flex flex-wrap gap-1.5 mb-1 mt-0.5">
                          {data.longtermCortison && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 border border-blue-200/50 text-blue-800">
                              Cortison
                            </span>
                          )}
                          {data.longtermRheuma && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 border border-blue-200/50 text-blue-800">
                              Rheumamittel
                            </span>
                          )}
                          {!data.longtermCortison && !data.longtermRheuma && (
                            <span className="text-xs font-extrabold text-zinc-400">Keine (Cortison/Rheumamittel)</span>
                          )}
                        </div>
                        {data.otherLongtermMeds.trim() && (
                          <span className="block text-xs font-extrabold text-[#003527]">{data.otherLongtermMeds}</span>
                        )}
                      </div>
                      
                      <div className="space-y-0.5 border-t border-zinc-100 pt-2.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Derzeitige Medikamente</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.currentMeds.trim() ? data.currentMeds : 'Keine Angabe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              
              {/* BOX 6: Emotionale Historie */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-1 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Emotionale Historie</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Psychische Gesundheit & Belastungen</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3.5 text-left">
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
                  ) : (
                    <div className="grid grid-cols-1 gap-y-3.5 pt-1 text-left">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Stationäre Behandlung?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.emotionalHospitalization.trim() ? data.emotionalHospitalization : 'Keine Angabe'}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5 border-t border-zinc-100 pt-2.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Medikamente (emotional)?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.emotionalMeds.trim() ? data.emotionalMeds : 'Keine Angabe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOX 7: Geburt & Schwangerschaft */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-2 hover:border-[#bfc9c3]/60">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-50 border border-pink-200/40 text-pink-700">
                        <Baby className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Geburt & Schwangerschaft</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Besonderheiten und Vitalparameter</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 text-left">
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
                  ) : (
                    <div className="grid grid-cols-1 gap-y-3.5 pt-1 text-left">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Komplikationen bei eigener Geburt?</span>
                        <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                          {data.birthKomplications.trim() ? data.birthKomplications : 'Keine Angabe'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-2.5">
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-medium text-zinc-400">Schwanger?</span>
                          <span className="block text-xs font-extrabold text-[#003527] mt-0.5">
                            {data.pregnant === 'Ja' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-50 border border-pink-200/50 text-pink-800">
                                Ja
                              </span>
                            ) : data.pregnant === 'Nein' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-50 border border-zinc-200/50 text-zinc-500">
                                Nein
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-normal">Keine Angabe</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-medium text-zinc-400">Fehlgeburten?</span>
                          <span className="block text-xs font-extrabold text-[#003527] mt-0.5">
                            {data.miscarriages.trim() ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 border border-purple-200/50 text-purple-800">
                                {data.miscarriages}
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-normal">Keine Angabe</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOX 8: Cranio Erfahrung */}
              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden md:col-span-3 hover:border-[#bfc9c3]/60 bg-gradient-to-br from-white to-teal-50/5">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-4 border-b border-zinc-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 border border-teal-200/40 text-teal-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Cranio-Erfahrung</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Erfahrungen mit Craniosacraler Behandlung</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">Bisherige Craniosacrale Behandlungen?</label>
                      <textarea
                        rows={3}
                        value={data.cranioExperience}
                        onChange={(e) => updateField('cranioExperience', e.target.value)}
                        placeholder="Falls ja, wann und wie oft? Wie haben Sie diese empfunden?"
                        className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all resize-none min-h-[70px]"
                      />
                    </div>
                  ) : (
                    <div className="pl-3 border-l-2 border-teal-500/30 space-y-1 text-left pt-1">
                      <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Bisherige craniosacrale Behandlungen</span>
                      <span className="block text-xs font-extrabold text-[#003527] whitespace-pre-wrap leading-relaxed">
                        {data.cranioExperience.trim() ? data.cranioExperience : 'Keine Angabe'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
