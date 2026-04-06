import { motion } from "motion/react";
import { Clock, Users, MessageSquare, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MeetingAgenda, AgendaItem } from "@/lib/gemini";

interface AgendaTimelineProps {
  agenda: MeetingAgenda;
}

export function AgendaTimeline({ agenda }: AgendaTimelineProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{agenda.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{agenda.summary}</p>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {agenda.stakeholders.map((stakeholder, idx) => (
            <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm font-medium">
              <Users className="w-3 h-3 mr-1.5" />
              {stakeholder}
            </Badge>
          ))}
        </div>
      </motion.div>

      <Separator className="bg-border/50" />

      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {agenda.items.map((item, idx) => (
          <TimelineItem key={idx} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item, index }: { item: AgendaItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
    >
      {/* Dot */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
        <Clock className="w-5 h-5 text-primary" />
      </div>

      {/* Content Card */}
      <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
              {item.time}
            </span>
            <Badge variant="outline" className="text-xs font-medium">
              {item.duration}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
            {item.topic}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {item.stakeholders.map((s, i) => (
              <span key={i} className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                {s}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
