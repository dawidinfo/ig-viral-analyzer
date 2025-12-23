import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Plus, Trash2, Edit2, Save, X, Lightbulb, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";

interface NotesTabProps {
  userId: number;
}

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function NotesTab({ userId }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Hook-Strategien die funktionieren",
      content: "1. Frage stellen die neugierig macht\n2. Kontroverse Aussage\n3. Überraschende Statistik\n4. 'Niemand spricht darüber...'\n5. Pattern Interrupt mit ungewöhnlichem Visual",
      tags: ["hooks", "viral", "strategie"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Beste Posting-Zeiten",
      content: "Instagram: 11-13 Uhr und 19-21 Uhr\nTikTok: 7-9 Uhr und 19-23 Uhr\nYouTube: 14-16 Uhr Wochentags",
      tags: ["timing", "strategie"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [editNote, setEditNote] = useState({ title: "", content: "", tags: "" });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreate = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Titel und Inhalt sind erforderlich");
      return;
    }

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", tags: "" });
    setIsCreating(false);
    toast.success("Notiz erstellt");
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
  };

  const handleSaveEdit = (id: number) => {
    if (!editNote.title.trim() || !editNote.content.trim()) {
      toast.error("Titel und Inhalt sind erforderlich");
      return;
    }

    setNotes(notes.map(n => 
      n.id === id 
        ? {
            ...n,
            title: editNote.title,
            content: editNote.content,
            tags: editNote.tags.split(",").map(t => t.trim()).filter(Boolean),
            updatedAt: new Date().toISOString(),
          }
        : n
    ));
    setEditingId(null);
    toast.success("Notiz aktualisiert");
  };

  const handleDelete = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success("Notiz gelöscht");
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary" />
                Meine Learnings & Notizen
              </CardTitle>
              <CardDescription>
                Halte deine Erkenntnisse und Strategien fest
              </CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} className="btn-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Neue Notiz
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Create New Note Form */}
          {isCreating && (
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-primary/20">
              <div className="space-y-4">
                <Input
                  placeholder="Titel der Notiz..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Deine Erkenntnisse, Strategien oder Learnings..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="bg-background/50 min-h-[120px]"
                />
                <Input
                  placeholder="Tags (kommagetrennt, z.B. hooks, viral, strategie)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  className="bg-background/50"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="btn-gradient text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Abbrechen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Noch keine Notizen erstellt</p>
              <p className="text-sm text-muted-foreground mt-2">
                Halte deine Learnings aus den Analysen fest
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {editingId === note.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editNote.title}
                        onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        className="bg-background/50"
                      />
                      <Textarea
                        value={editNote.content}
                        onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                        className="bg-background/50 min-h-[120px]"
                      />
                      <Input
                        value={editNote.tags}
                        onChange={(e) => setEditNote({ ...editNote, tags: e.target.value })}
                        className="bg-background/50"
                        placeholder="Tags (kommagetrennt)"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit(note.id)} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-lg">{note.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-3">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="glass-card border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
            <Lightbulb className="w-4 h-4" />
            Tipp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nutze Notizen um Muster zu erkennen: Was haben erfolgreiche Accounts gemeinsam? 
            Welche Hook-Strategien funktionieren in deiner Nische? Dokumentiere deine Erkenntnisse 
            und baue dir eine persönliche Strategie-Bibliothek auf.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
