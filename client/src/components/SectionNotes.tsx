import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { 
  Save, 
  Loader2, 
  Plus, 
  Check, 
  Trash2, 
  Edit3,
  StickyNote,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

interface SectionNotesProps {
  username: string;
  section: 'analyse' | 'erkenntnisse' | 'learnings';
  title?: string;
}

export function SectionNotes({ username, section, title }: SectionNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing notes
  const { data: existingNotes, isLoading } = trpc.dashboard.getAnalysisNotes.useQuery(
    { username: username.toLowerCase(), section },
    { enabled: !!user && !!username }
  );

  // Save notes mutation
  const saveNotesMutation = trpc.dashboard.saveAnalysisNotes.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      setHasChanges(false);
      setIsEditing(false);
      toast.success('Notizen gespeichert');
    },
    onError: (error) => {
      setIsSaving(false);
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  });

  // Load existing notes when data arrives
  useEffect(() => {
    if (existingNotes) {
      setNotes(existingNotes.notes || '');
      setActionItems(existingNotes.actionItems || []);
    }
  }, [existingNotes]);

  const handleSave = () => {
    if (!user) {
      toast.error('Bitte melde dich an um Notizen zu speichern');
      return;
    }
    
    setIsSaving(true);
    saveNotesMutation.mutate({
      username: username.toLowerCase(),
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
    setNewActionItem('');
    setHasChanges(true);
  };

  const toggleActionItem = (id: string) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    setHasChanges(true);
  };

  const deleteActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  if (!user) {
    return (
      <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <StickyNote className="w-4 h-4" />
          <span>Melde dich an um persönliche Notizen zu speichern</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Lade Notizen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 sm:p-6 border border-border/50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-400" />
          <h4 className="font-medium">{title || 'Meine Notizen'}</h4>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-400">Ungespeicherte Änderungen</span>
          )}
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Speichern
            </Button>
          )}
        </div>
      </div>

      {/* Notes Textarea */}
      {isEditing ? (
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Schreibe deine Gedanken, Erkenntnisse und Learnings hier auf..."
          className="min-h-[120px] bg-background/50 border-border/50 resize-y"
        />
      ) : notes ? (
        <div className="bg-background/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
          {notes}
        </div>
      ) : (
        <div className="bg-background/30 rounded-lg p-4 text-sm text-muted-foreground italic">
          Noch keine Notizen. Klicke auf "Bearbeiten" um deine Gedanken festzuhalten.
        </div>
      )}

      {/* Action Items */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Action Items</span>
          <span className="text-xs text-muted-foreground">
            ({actionItems.filter(i => i.completed).length}/{actionItems.length} erledigt)
          </span>
        </div>

        {/* Existing Action Items */}
        <div className="space-y-2">
          {actionItems.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                item.completed ? 'bg-green-500/10' : 'bg-background/30'
              }`}
            >
              <button
                onClick={() => toggleActionItem(item.id)}
                className="flex-shrink-0"
              >
                {item.completed ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.text}
              </span>
              {isEditing && (
                <button
                  onClick={() => deleteActionItem(item.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Action Item */}
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addActionItem()}
              placeholder="Neues Action Item hinzufügen..."
              className="flex-1 px-3 py-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addActionItem}
              disabled={!newActionItem.trim()}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {actionItems.length === 0 && !isEditing && (
          <p className="text-xs text-muted-foreground italic">
            Keine Action Items. Bearbeite um welche hinzuzufügen.
          </p>
        )}
      </div>
    </div>
  );
}

export default SectionNotes;
