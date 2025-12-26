import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  PenTool, 
  Lightbulb, 
  Target,
  Rocket,
  Brain,
  ListChecks,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisNotesProps {
  username: string;
  section: 'analyse' | 'erkenntnisse' | 'learnings';
}

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

const sectionConfig = {
  analyse: {
    title: "Notizen zur Analyse",
    icon: <Brain className="w-5 h-5" />,
    placeholder: "Was fällt dir bei den Zahlen auf? Welche Metriken sind besonders interessant?",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30"
  },
  erkenntnisse: {
    title: "Notizen zu Erkenntnissen",
    icon: <Lightbulb className="w-5 h-5" />,
    placeholder: "Welche Muster erkennst du? Was kannst du von diesem Account lernen?",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30"
  },
  learnings: {
    title: "Deine Learnings & Impulse",
    icon: <Rocket className="w-5 h-5" />,
    placeholder: "Was wirst du konkret umsetzen? Welche Ideen hast du für deinen eigenen Content?",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30"
  }
};

export function AnalysisNotes({ username, section }: AnalysisNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const config = sectionConfig[section];

  // Load saved notes
  const { data: savedNotes, refetch } = trpc.dashboard.getAnalysisNotes.useQuery(
    { username, section },
    { enabled: !!user && !!username }
  );

  // Save notes mutation
  const saveNotesMutation = trpc.dashboard.saveAnalysisNotes.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setIsSaving(false);
      toast.success("Notizen gespeichert");
    },
    onError: () => {
      setIsSaving(false);
      toast.error("Fehler beim Speichern");
    }
  });

  // Load saved notes on mount
  useEffect(() => {
    if (savedNotes) {
      setNotes(savedNotes.notes || "");
      setActionItems(savedNotes.actionItems || []);
    }
  }, [savedNotes]);

  const handleSave = () => {
    if (!user) {
      toast.error("Bitte einloggen um Notizen zu speichern");
      return;
    }
    setIsSaving(true);
    saveNotesMutation.mutate({
      username,
      section,
      notes,
      actionItems
    });
  };

  const addActionItem = () => {
    if (!newActionItem.trim()) return;
    const newItem: ActionItem = {
      id: Date.now().toString(),
      text: newActionItem.trim(),
      completed: false
    };
    setActionItems([...actionItems, newItem]);
    setNewActionItem("");
  };

  const toggleActionItem = (id: string) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  if (!user) {
    return (
      <Card className={`bg-gradient-to-br ${config.color} border ${config.borderColor} opacity-60`}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <PenTool className="w-4 h-4 inline mr-2" />
            Einloggen um Notizen zu speichern
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${config.color} border ${config.borderColor} transition-all duration-300`}>
      <CardHeader 
        className="cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {config.icon}
            {config.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Gespeichert
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {isExpanded ? "Einklappen" : "Aufklappen"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-2">
          {/* Notes Textarea */}
          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={config.placeholder}
              className="min-h-[100px] bg-black/20 border-white/10 resize-none"
            />
          </div>

          {/* Action Items */}
          {section === 'learnings' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Action Items</span>
              </div>
              
              {/* Existing items */}
              <div className="space-y-2">
                {actionItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-2 p-2 rounded-lg bg-black/20 ${item.completed ? 'opacity-60' : ''}`}
                  >
                    <button
                      onClick={() => toggleActionItem(item.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        item.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-white/30 hover:border-green-500'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeActionItem(item.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addActionItem()}
                  placeholder="Neues Action Item..."
                  className="flex-1 px-3 py-2 text-sm bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-green-500/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addActionItem}
                  className="border-green-500/30 hover:bg-green-500/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Notizen speichern
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
