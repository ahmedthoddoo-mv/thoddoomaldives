import Card from "@/components/ui/Card";
import type { FAQ } from "@/types/faq";

export default function FAQCard({ faq }: { faq: FAQ }) {
  return (
    <Card>
      <details className="group">
        <summary className="cursor-pointer list-none text-xl font-bold text-slate-900">
          {faq.question}
        </summary>
        <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
      </details>
    </Card>
  );
}
