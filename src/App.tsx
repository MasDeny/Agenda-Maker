import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, Loader2, Sparkles, Plus, Trash2, Calendar, Users, Clock, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { generateAgendaFromDoc, type MeetingAgenda } from "@/lib/gemini";
import { AgendaTimeline } from "@/components/AgendaTimeline";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [history, setHistory] = useState<{ name: string; agenda: MeetingAgenda }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected`);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result?.toString().split(",")[1];
          if (result) resolve(result);
          else reject(new Error("Failed to read file"));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await generateAgendaFromDoc(base64, file.type);
      setAgenda(result);
      setHistory((prev) => [{ name: file.name, agenda: result }, ...prev]);
      toast.success("Agenda generated successfully!");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAgenda(null);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tight">Agenda AI</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Builder v1.0</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
                  <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors truncate w-full">
                  {file ? file.name : "Upload Document"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">PDF, DOCX, TXT, IMAGE</p>
              </div>
            </label>
          </div>

          <Button
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={!file || isProcessing}
            onClick={processFile}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Agenda
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Recent Agendas</h3>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 px-2 italic">No history yet</p>
              ) : (
                history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAgenda(item.agenda);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {item.agenda.items.length} Topics
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Engine Ready</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={reset}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 border-r bg-muted/30 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-background flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="font-bold text-lg">Agenda AI</h2>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {!agenda ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-muted flex items-center justify-center mb-8 relative">
                  <FileText className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground/40" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">Ready to build your agenda?</h2>
                <p className="text-sm lg:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Upload a document, meeting notes, or even a screenshot of a whiteboard to generate a structured timeline with stakeholders and topics.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
                  {[
                    { icon: Users, label: "Stakeholders", desc: "Auto-identify key participants" },
                    { icon: Clock, label: "Timelines", desc: "Smart duration allocation" },
                    { icon: Sparkles, label: "AI Insights", desc: "Context-aware descriptions" }
                  ].map((feature, i) => (
                    <div key={i} className="p-4 lg:p-6 rounded-2xl border bg-muted/30 text-left space-y-3">
                      <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                      <h4 className="font-bold text-sm">{feature.label}</h4>
                      <p className="text-[11px] lg:text-xs text-muted-foreground leading-normal">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="agenda"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 lg:py-12"
              >
                <AgendaTimeline agenda={agenda} />
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </main>
    </div>
  );
}
