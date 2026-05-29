import ReactMarkdown from "react-markdown"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Clock,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
} from "lucide-react"
import { type Topic } from "../types"

export default function TopicView({ topic }: { topic: Topic }) {
  // 1. Total Failure Fallback: If the topic object itself is missing
  if (!topic) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-muted-foreground">
        <AlertTriangle className="mb-4 h-10 w-10 text-destructive opacity-50" />
        <h3 className="text-lg font-medium text-foreground">
          Topic Data Missing
        </h3>
        <p className="text-sm">
          The content for this section could not be loaded.
        </p>
      </div>
    )
  }

  // 2. Safe Array Extraction: Prevents .map() from crashing if keys are undefined
  const outcomes = topic.learning_outcomes || []
  const examples = topic.examples || []
  const mistakes = topic.common_mistakes || []
  const qnaList = topic.qna || []

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header & Metadata */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {topic.title || "Untitled Topic"}
        </h1>
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={topic.difficulty === "easy" ? "secondary" : "default"}
          >
            <BrainCircuit className="mr-1 h-3 w-3" />
            {topic.difficulty || "Unrated"}
          </Badge>
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {topic.estimated_time || "Time unknown"}
          </Badge>
        </div>
      </div>

      {/* Learning Outcomes */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Learning Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {outcomes.length > 0 ? (
              outcomes.map((outcome, i) => <li key={i}>{outcome}</li>)
            ) : (
              <li className="italic">No learning outcomes specified.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Markdown / HTML Content */}
      <div className="prose max-w-none border-l-4 border-muted pl-6 prose-slate dark:prose-invert">
        {topic.content ? (
          topic.content.trim().startsWith("<") || topic.content.includes("</") ? (
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          ) : (
            <ReactMarkdown>{topic.content}</ReactMarkdown>
          )
        ) : (
          <p className="text-muted-foreground italic">
            Detailed reading material is not currently available for this topic.
          </p>
        )}
      </div>

      {/* Examples & Mistakes Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Real-world Examples</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1">
              {examples.length > 0 ? (
                examples.map((ex, i) => <li key={i}>{ex}</li>)
              ) : (
                <li className="italic">No examples available.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> Common Mistakes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1">
              {mistakes.length > 0 ? (
                mistakes.map((mistake, i) => <li key={i}>{mistake}</li>)
              ) : (
                <li className="italic">No common mistakes listed.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Q&A Section */}
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="mb-6 text-2xl font-bold">Knowledge Check (Q&A)</h3>

        {qnaList.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {qnaList.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left font-medium">
                  Q: {item.q || "Unknown Question"}
                </AccordionTrigger>
                <AccordionContent className="mt-2 rounded-md bg-muted/30 p-4 text-muted-foreground">
                  <span className="mr-2 font-semibold text-foreground">A:</span>
                  {item.a || "Answer pending."}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-muted-foreground">
            <FileQuestion className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">
              No knowledge check questions available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
